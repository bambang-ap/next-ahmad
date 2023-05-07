import bufferToDataUrl from "buffer-to-data-url";
import qr, {image_type} from "qr-image";
import {z} from "zod";

import {tCustomer, TDashboard} from "@appTypes/app.zod";
import {TABLES} from "@enum";
import {checkCredentialV2, generateId, getNow, MAPPING_CRUD_ORM} from "@server";
import {procedure, router} from "@trpc";
import {TRPCError} from "@trpc/server";

const qrInput = z.string().or(z.string().array()).optional();

const miscRouter = {
	now: procedure.query(getNow),
	generateId: procedure.query(generateId),
	qr: procedure
		.input(
			qrInput.or(
				z.object({
					type: z.enum(["png", "svg", "pdf", "eps"]).optional(),
					input: qrInput,
				}),
			),
		)
		.query(({input}) => {
			function generateQr(type: image_type, input?: string) {
				if (!input) return null;

				const qrImage = qr.imageSync(input, {type});

				if (type === "svg") return `data:image/svg+xml;utf8,${qrImage}`;

				// @ts-ignore
				return bufferToDataUrl(`image/${type}`, qrImage);
			}

			function renderQrGenerated(
				input?: string | string[],
				type: image_type = "png",
			) {
				if (Array.isArray(input))
					return input.map(input => generateQr(type, input));

				return generateQr(type, input);
			}

			if (!input) return null;

			if (typeof input === "string" || Array.isArray(input))
				return renderQrGenerated(input);

			return renderQrGenerated(input.input, input.type);
		}),
	exampleData: router({
		get: procedure.input(z.enum(["customer"])).query(({input}) => {
			switch (input) {
				case "customer":
					return generateShape(tCustomer);
				default:
					throw new TRPCError({code: "BAD_REQUEST"});
			}

			function generateShape<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
				return [
					Object.keys(schema.shape).reduce<MyObject>((ret, key) => {
						if (key === "id") return ret;

						return {...ret, [key as string]: ""};
					}, {}),
				];
			}
		}),
	}),
	dashboard: procedure.query(({ctx}) =>
		checkCredentialV2(ctx, async (): Promise<Omit<TDashboard, "table">[]> => {
			const data: TDashboard[] = [
				{
					table: TABLES.MESIN,
					title: "Mesin",
					path: "/app/mesin",
					image: "/public/assets/dashboard/mesin.png",
					className: "bg-cyan-600",
				},
				{
					table: TABLES.CUSTOMER,
					title: "Customer",
					path: "/app/customer",
					image: "/public/assets/dashboard/customer.png",
					className: "bg-green-600",
				},
			];

			return Promise.all(
				data.map<Promise<Omit<TDashboard, "table">>>(
					async ({table, image, ...item}) => {
						// @ts-ignore
						const count = await MAPPING_CRUD_ORM[table].count();
						return {...item, count, image: image?.replace("/public", "")};
					},
				),
			);
		}),
	),
};

export default miscRouter;

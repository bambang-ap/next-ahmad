import bufferToDataUrl from "buffer-to-data-url";
import qr, {image_type} from "qr-image";
import {z} from "zod";

import {tCustomer} from "@appTypes/app.zod";
import {isProd} from "@constants";
import {
	ORM,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmPOItemSppbIn,
} from "@database";
import {generateId, getNow} from "@server";
import {procedure, router} from "@trpc";
import {TRPCError} from "@trpc/server";

const qrInput = z.string().or(z.string().array()).optional();

const miscRouter = {
	test: procedure.query(() => {
		return OrmCustomerPO.findAll({
			limit: 3,
			logging: true,
			include: [
				OrmCustomer,
				{
					separate: true,
					model: OrmCustomerSPPBIn,
					include: [
						{
							model: OrmPOItemSppbIn,
							separate: true,
							include: [
								{model: OrmKanbanItem, separate: true, include: [OrmKanban]},
							],
						},
					],
				},
			],
		});
	}),
	statsActivity: procedure.query(async () => {
		if (isProd) throw new TRPCError({code: "NOT_FOUND"});
		const [queries] = await ORM.query(
			`SELECT * FROM pg_stat_activity WHERE wait_event IS NOT NULL AND backend_type = 'client backend';`,
		);

		return {count: queries.length, queries};
	}),
	dropTables: procedure.query(async () => {
		if (isProd) throw new TRPCError({code: "NOT_FOUND"});
		const [queries] = await ORM.query(
			`select 'drop table if exists "' || tablename || '" cascade;' as query from pg_tables where schemaname = 'public' LIMIT 100 OFFSET 0`,
		);

		// @ts-ignore
		return queries.map(e => e.query).join("");
	}),
	now: procedure.query(getNow),
	generateId: procedure
		.input(z.string().optional())
		.query(({input}) => generateId(input)),
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

						return {...ret, [key]: ""};
					}, {}),
				];
			}
		}),
	}),
};

export default miscRouter;

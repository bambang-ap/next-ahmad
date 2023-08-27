import {Route} from "pages/app/scan/[route]";
import {DECIMAL, Op, Order} from "sequelize";

import {
	Context,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TKanban,
	TMasterItem,
	TScan,
} from "@appTypes/app.type";
import {ORM, OrmCustomerSPPBIn, OrmKanban, OrmScan} from "@database";
import {PO_STATUS} from "@enum";
import {appRouter} from "@trpc/routers";

export * from "./relation";

export function ormDecimalType(fieldName: string) {
	return {
		type: DECIMAL,
		get(): number {
			// @ts-ignore
			const value = this?.getDataValue?.(fieldName);
			return value ? parseFloat(value ?? 0) : 0;
		},
	};
}

export function wherePages(
	searchKey?: string | string[],
	search?: string,
): any {
	if (!searchKey || !search) return undefined;

	if (!Array.isArray(searchKey)) {
		return {
			[searchKey]: {
				[Op.iLike]: `%${search}%`,
			},
		};
	}

	return {
		[Op.or]: searchKey.map(key => {
			return {
				[key]: {
					[Op.iLike]: `%${search}%`,
				},
			};
		}),
	};
}

export async function getCurrentPOStatus(id_po: string): Promise<PO_STATUS> {
	const [sppbIn, kanban, [sppbOut]] = await Promise.all([
		OrmCustomerSPPBIn.findOne({
			where: {id_po},
			attributes: ["id"] as (keyof TCustomerSPPBIn)[],
		}),

		OrmKanban.findOne({
			where: {id_po},
			attributes: ["id", "id_sppb_in"] as (keyof TKanban)[],
		}),

		ORM.query(
			`select * from customer_sppb_out where (po::jsonb @> '[{"id_po":"${id_po}"}]')`,
		) as Promise<[TCustomerSPPBOut[], unknown]>,
	] as const);

	const scan = await OrmScan.findOne({
		where: {id_kanban: {[Op.eq]: kanban?.dataValues.id}},
		attributes: [
			"status_produksi",
			"status_qc",
			"status_finish_good",
		] as (keyof TScan)[],
	});

	if (sppbOut.length > 0) return PO_STATUS.G;
	if (scan?.dataValues.status_finish_good) return PO_STATUS.F;
	if (scan?.dataValues.status_qc) return PO_STATUS.E;
	if (scan?.dataValues.status_produksi) return PO_STATUS.D;
	if (kanban?.dataValues.id) return PO_STATUS.C;
	if (sppbIn?.dataValues.id) return PO_STATUS.B;
	return PO_STATUS.A;
}

export async function processMapper(
	ctx: Context,
	{
		instruksi: process,
		kategori_mesinn,
	}: Partial<Pick<TMasterItem, "instruksi" | "kategori_mesinn">>,
) {
	const routerCaller = appRouter.createCaller(ctx);
	const processes = await routerCaller.kanban.mesinProcess({
		process,
		kategoriMesin: kategori_mesinn,
	});

	const instruksi = processes
		.map(e => e.dataProcess.map(r => r.process.name).join(" | "))
		.join(" - ");

	return instruksi;
}

export function OrmScanOrder(target: Route["route"]): Order {
	return [[`date.${target}_updatedAt`, "DESC NULLS LAST"]];
}

// FIXME: Seharusnya cek apakah datanya sudah closed atau belum
// export async function getCurrentPOStatusExpected(id_po: string): Promise<PO_STATUS> {
// 	const listSppbIn = (
// 		await OrmCustomerSPPBIn.findAll({
// 			where: {id_po},
// 			attributes: ["id"] as (keyof TCustomerSPPBIn)[],
// 		})
// 	).map(async ({dataValues: sppbIn}) => {
// 		const listKanban = (
// 			await OrmKanban.findAll({
// 				where: {id_po, id_sppb_in: sppbIn.id},
// 				attributes: ["id", "id_sppb_in"] as (keyof TKanban)[],
// 			})
// 		).map(async ({dataValues: kanban}) => {
// 			return kanban;
// 		});

// 		return {sppbIn, listKanban: await Promise.all(listKanban)};
// 	});

// 	prettyConsole(await Promise.all(listSppbIn), "\n--------\n");

// 	if (!!listSppbIn) return PO_STATUS.B;

// 	return PO_STATUS.A;
// }

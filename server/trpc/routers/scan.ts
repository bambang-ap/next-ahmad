import moment from "moment";

import {PagingResult, TDataScan, TDocument, TScan} from "@appTypes/app.type";
import {
	tableFormValue,
	tScan,
	TScanDate,
	tScanItem,
	TScanTarget,
	tScanTarget,
	UnitQty,
	zId,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {
	NumberOrderAttribute,
	OrmDocument,
	OrmKanban,
	OrmKanbanItem,
	OrmScan,
	OrmScanOrder as scanOrder,
} from "@database";
import {CATEGORY_REJECT_DB} from "@enum";
import {checkCredentialV2, pagingResult} from "@server";
import {procedure, router} from "@trpc";
import {appRouter} from "@trpc/routers";
import {TRPCError} from "@trpc/server";
import {qtyMap} from "@utils";

export type ScanList = TScan & {number: string; OrmDocument: TDocument};
type ListResult = PagingResult<ScanList>;

function enabled(target: TScanTarget, dataScan?: TDataScan) {
	switch (target) {
		case "produksi":
			return true;
		case "qc":
			return dataScan?.status_produksi;
		case "finish_good":
			return dataScan?.status_qc;
		// case 'out_barang':
		// 	return dataScan?.status_finish_good;
		default:
			return false;
	}
}

const scanRouters = router({
	editNotes: procedure
		.input(tScan.pick({id: true, notes: true}).partial())
		.mutation(({ctx, input: {id, notes}}) => {
			return checkCredentialV2(ctx, async () => {
				await OrmScan.update({notes}, {where: {id_kanban: id}});

				return Success;
			});
		}),
	list: procedure
		.input(tableFormValue.extend({target: tScanTarget}))
		.query(({ctx, input}) => {
			const {limit, page, target} = input;
			return checkCredentialV2(ctx, async (): Promise<ListResult> => {
				const {count, rows: data} = await OrmScan.findAndCountAll({
					limit,
					attributes: [
						"id",
						"id_kanban",
						"date",
						NumberOrderAttribute<TScan>("id"),
					],
					order: scanOrder(target),
					offset: (page - 1) * limit,
					where: {[`status_${target}`]: true},
					logging: true,
				});
				const allDataScan = data.map(async ({dataValues}) => {
					const kanban = await OrmKanban.findOne({
						attributes: [],
						include: [OrmDocument],
						where: {id: dataValues.id_kanban},
					});
					return {...dataValues, ...kanban?.dataValues};
				});

				return pagingResult(
					count,
					page,
					limit,
					(await Promise.all(allDataScan)) as ScanList[],
				);
			});
		}),
	get: procedure
		.input(zId.extend({target: tScanTarget}))
		.query(async ({input: {id, target}, ctx: {req, res}}) => {
			return checkCredentialV2(
				{req, res},
				async (): Promise<TDataScan | null> => {
					const routerCaller = appRouter.createCaller({req, res});
					const dataKanban = await routerCaller.kanban.get({
						type: "kanban",
						where: {id},
					});

					const dataScan = await OrmScan.findOne({
						where: {id_kanban: id},
					});

					if (dataScan) {
						const dataScann = {...dataScan?.dataValues, dataKanban};
						// @ts-ignore
						if (!enabled(target, dataScann))
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Data tidak ditemukan",
							});

						// @ts-ignore
						return dataScann;
					}

					return null;
				},
			);
		}),

	update: procedure
		.input(
			tScanItem.extend({
				target: tScanTarget,
				...tScan.pick({id: true, lot_no_imi: true}).shape,
			}),
		)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(
				{req, res},
				async (): Promise<{message: string}> => {
					const routerCaller = appRouter.createCaller({req, res});

					const {id, target, ...rest} = input;
					const statusTarget = `status_${target}` as const;
					const itemTarget = `item_${target}` as const;

					const dataScan = await routerCaller.scan.get({id, target});

					if (!dataScan) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: "Failed to get dataScan",
						});
					}

					if (!enabled(target, dataScan)) {
						throw new TRPCError({code: "BAD_REQUEST", message: "Failed"});
					}

					const prevDate = await OrmScan.findOne({where: {id: dataScan.id}});
					const date: TScanDate = {
						...prevDate?.dataValues.date,
						[`${target}_updatedAt`]: moment(),
					};

					await OrmScan.update(
						{[statusTarget]: true, date, ...rest},
						{where: {id: dataScan.id}},
					);

					switch (target) {
						case "qc":
							const i = 0;
							const {item_qc, item_qc_reject, item_qc_reject_category} = rest;
							let updateFg = false;
							let toKanban = {} as UnitQty;
							qtyMap(({num, qtyKey}): any => {
								const qty = item_qc_reject?.[i]?.[num]! as number;
								const reason = item_qc_reject_category?.[i]?.[num]!;
								switch (reason) {
									case CATEGORY_REJECT_DB.A:
									case CATEGORY_REJECT_DB.C:
									case CATEGORY_REJECT_DB.B:
										if (qty > 0) {
											if (reason === CATEGORY_REJECT_DB.B)
												return (toKanban[qtyKey] = qty);
											else return (updateFg = true);
										}
										break;
									default:
										break;
								}
							});

							const p = [
								Object.keys(toKanban).length > 0 &&
									OrmKanbanItem.update(toKanban, {
										where: {id: item_qc![i]![0]},
									}),
								updateFg &&
									OrmScan.update(
										{
											status_finish_good: true,
											item_finish_good: item_qc,
										},
										{where: {id: dataScan.id}},
									),
							];

							await Promise.all(p);
							break;

						default:
							const promisedUpdateItem = rest[itemTarget]?.map(
								async ([idItem, ...qtys]) => {
									const f = qtyMap(({qtyKey}, i) => {
										if (!qtys[i]) return;
										return {[qtyKey]: qtys[i]};
									});
									const updatedQty = f.reduce(
										(a, b) => ({...a, ...b}),
										{} as UnitQty,
									);
									return OrmKanbanItem.update(updatedQty, {
										where: {id: idItem},
									});
								},
							);
							await Promise.all(promisedUpdateItem ?? []);
							break;
					}

					return Success;
				},
			);
		}),
});

export default scanRouters;

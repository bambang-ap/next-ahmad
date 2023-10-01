import {Includeable} from "sequelize";
import {z} from "zod";

import {PagingResult, TDataScan, TScan} from "@appTypes/app.type";
import {
	tableFormValue,
	tRoute,
	tScan,
	TScanDate,
	tScanItem,
	tScanNew,
	tScanNewItem,
	TScanTarget,
	tScanTarget,
	UnitQty,
	zId,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {
	getScanAttributes,
	getScanAttributesV2,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScan,
	OrmScanNew,
	OrmScanNewItem,
	OrmScanOrder as scanOrder,
	OrmUser,
	scanListAttributes,
	wherePagesV2,
} from "@database";
import {CATEGORY_REJECT_DB} from "@enum";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";
import {appRouter} from "@trpc/routers";
import {TRPCError} from "@trpc/server";
import {moment, qtyMap, qtyReduce, scanRouterParser} from "@utils";

export type ScanList = ReturnType<typeof scanListAttributes>["Ret"];
export type ScanGet = ReturnType<typeof getScanAttributes>["Ret"];
export type ScanGetV2 = ReturnType<typeof getScanAttributesV2>["Ret"];

type ListResult = PagingResult<ScanList>;

function enabled(target: TScanTarget, dataScan?: TScan) {
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
		.input(tScanNew.pick({id: true, status: true, notes: true}).partial())
		.mutation(({ctx, input: {id, notes, status}}) => {
			return checkCredentialV2(ctx, async () => {
				await OrmScanNew.update({notes}, {where: {id_kanban: id, status}});

				return Success;
			});
		}),
	list: procedure
		.input(tableFormValue.extend({target: tScanTarget}))
		.query(({ctx, input}) => {
			const {limit, page, search, target} = input;

			const {A, B, C, D, E, num, Ret} = scanListAttributes();

			return checkCredentialV2(ctx, async (): Promise<ListResult> => {
				const {count, rows: data} = await OrmScan.findAndCountAll({
					limit,
					attributes: [num, ...A.keys],
					order: scanOrder(target),
					offset: (page - 1) * limit,
					where: {
						[`status_${target}`]: true,
						...wherePagesV2<ScanList>(
							[
								"$OrmKanban.keterangan$",
								"$OrmKanban.nomor_kanban$",
								"$OrmKanban.OrmCustomerPO.nomor_po$",
								"$OrmKanban.OrmCustomerSPPBIn.nomor_surat$",
								"$OrmKanban.OrmCustomerPO.OrmCustomer.name$",
							],
							search,
						),
					},
					include: [
						{
							model: OrmKanban,
							attributes: B.keys,
							include: [
								{model: OrmCustomerSPPBIn, attributes: C.keys},
								{
									attributes: D.keys,
									model: OrmCustomerPO,
									include: [{model: OrmCustomer, attributes: E.keys}],
								},
							],
						},
					],
				});

				// @ts-ignore
				const allDataScan = data.map(e => e.dataValues as typeof Ret);

				return pagingResult(count, page, limit, allDataScan);
			});
		}),
	getV2: procedure.input(zId.extend(tRoute.shape)).query(({ctx, input}) => {
		const {id: id_kanban, route} = input;

		const {A, B, C, D, E, F, G, H, I, J, Ret} = getScanAttributes(route);

		return checkCredentialV2(ctx, async () => {
			const data = await OrmScan.findOne({
				where: {id_kanban},
				attributes: A.keys,
				include: [
					{
						model: OrmKanban,
						attributes: B.keys,
						include: [
							{
								model: OrmUser,
								as: OrmKanban._aliasCreatedBy,
								attributes: C.keys,
							},
							{
								model: OrmCustomerSPPBIn,
								attributes: F.keys,
								include: [
									{
										model: OrmCustomerPO,
										attributes: D.keys,
										include: [{model: OrmCustomer, attributes: E.keys}],
									},
								],
							},
							{
								separate: true,
								attributes: G.keys,
								model: OrmKanbanItem,
								include: [
									{model: OrmMasterItem, attributes: J.keys},
									{
										model: OrmPOItemSppbIn,
										attributes: H.keys,
										include: [{model: OrmCustomerPOItem, attributes: I.keys}],
									},
								],
							},
						],
					},
				],
			});

			// @ts-ignore
			return data?.dataValues as typeof Ret;
		});
	}),
	getV3: procedure.input(zId.extend(tRoute.shape)).query(({ctx, input}) => {
		const {id, route} = input;

		const {
			scn,
			knb,
			scItem,
			knbItem,
			user,
			bin,
			binItem,
			cust,
			mItem,
			po,
			poItem,
		} = getScanAttributesV2();

		const asd: Includeable = {
			attributes: knb.keys,
			include: [
				{
					model: user.orm,
					as: OrmKanban._aliasCreatedBy,
					attributes: user.keys,
				},
				{
					model: bin.orm,
					attributes: bin.keys,
					include: [
						{
							model: po.orm,
							attributes: po.keys,
							include: [{model: cust.orm, attributes: cust.keys}],
						},
					],
				},
				{
					separate: true,
					attributes: knbItem.keys,
					model: knbItem.orm,
					include: [
						{model: mItem.orm, attributes: mItem.keys},
						{
							model: binItem.orm,
							attributes: binItem.keys,
							include: [{model: poItem.orm, attributes: poItem.keys}],
						},
					],
				},
			],
		};

		function asdd(status: TScanTarget) {
			return scn.orm.findOne({
				where: {id_kanban: id, status},
				include: [
					Object.assign(asd, {model: knb.orm}),
					{model: scItem.orm, attributes: scItem.keys},
				],
			});
		}

		return checkCredentialV2(ctx, async (): Promise<ScanGetV2> => {
			const {isFG, isProduksi, isQC} = scanRouterParser(route);
			const status: TScanTarget = isQC ? "produksi" : isFG ? "qc" : route;
			const count = await OrmScanNew.count({
				where: {id_kanban: id, status},
			});

			if (!isProduksi && count <= 0) {
				throw new TRPCError({code: "NOT_FOUND"});
			}

			const data = await asdd(route);

			if (!data) {
				const prevData = await asdd(
					route === "qc" ? "produksi" : route === "finish_good" ? "qc" : route,
				);

				if (prevData)
					return {...prevData.dataValues, id: undefined} as ScanGetV2;

				const kanban = await knb.orm.findOne({where: {id}, ...asd});
				// @ts-ignore
				return {OrmKanban: kanban?.dataValues as ScanGetV2["OrmKanban"]};
			}

			return data.dataValues as ScanGetV2;
		});
	}),

	updateV3: procedure
		.input(
			tScanNew.partial({id: true}).extend({
				items: z.record(tScanNewItem.partial({id: true, id_scan: true})),
				tempItems: z.record(tScanNewItem.partial()),
			}),
		)
		.mutation(({ctx, input}) => {
			const {items, status, id_kanban, ...scanData} = input;

			return checkCredentialV2(ctx, async () => {
				// 	const {id, target, id_customer, lot_no_imi} = input;
				const existingScan = await OrmScanNew.findOne({
					where: {id_kanban, status},
				});
				const [{dataValues: updatedScan}] = await OrmScanNew.upsert({
					...scanData,
					status,
					id_kanban,
					id: existingScan?.dataValues.id ?? generateId("SN_"),
				});

				for (const [id_item, item] of Object.entries(items)) {
					const qtys = qtyReduce((ret, {qtyKey}) => {
						return {...ret, [qtyKey]: item[qtyKey]};
					});

					const existingItem = await OrmScanNewItem.findOne({
						where: {id_kanban_item: id_item, id_scan: updatedScan.id},
					});
					OrmScanNewItem.upsert({
						...qtys,
						id: existingItem?.dataValues.id ?? generateId("SNI_"),
						id_scan: updatedScan.id,
						id_kanban_item: id_item,
					});
				}

				return Success;
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
					const {id, target, ...rest} = input;
					const statusTarget = `status_${target}` as const;
					const itemTarget = `item_${target}` as const;

					// const dataScan = await routerCaller.scan.get({id, target});
					const dataScan = await OrmScan.findOne({where: {id_kanban: id}});

					if (!dataScan) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: "Failed to get dataScan",
						});
					}

					if (!enabled(target, dataScan?.dataValues!)) {
						throw new TRPCError({code: "BAD_REQUEST", message: "Failed"});
					}

					const date: TScanDate = {
						...dataScan?.dataValues.date,
						[`${target}_updatedAt`]: moment(),
					};

					await OrmScan.update(
						{[statusTarget]: false, date, ...rest},
						{where: {id: dataScan.dataValues.id}},
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
										{where: {id: dataScan.dataValues.id}},
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

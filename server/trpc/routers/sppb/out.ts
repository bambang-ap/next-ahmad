import {
	KanbanGetRow,
	PagingResult,
	TCustomerSPPBOutItem,
	TCustomerSPPBOutUpsert,
	TKanbanUpsertItem,
	TScanTarget,
} from "@appTypes/app.type";
import {
	tableFormValue,
	tCustomerSPPBOutUpsert,
	TScan,
	zId,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {
	attrParserV2,
	dInItem,
	dItem,
	dKanban,
	dKnbItem,
	dOutItem,
	dPo,
	dPoItem,
	dRejItem,
	dScan,
	dScanItem,
	dSJIn,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmCustomerSPPBOutItem,
	OrmKanban,
	OrmKanbanItem,
	OrmKendaraan,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScan,
	sppbOutGetAttributes,
	sppbOutGetPoAttributes,
	wherePagesV2,
	wherePagesV3,
} from "@database";
import {checkCredentialV2, generateId, genInvoice, pagingResult} from "@server";
import {procedure, router} from "@trpc";

import {z} from "zod";

import {appRouter} from "..";

type GetPage = PagingResult<TCustomerSPPBOutUpsert>;
export type GetFGRet = TScan & {
	kanban: Omit<KanbanGetRow, "items"> & {
		items: MyObject<TKanbanUpsertItem & {lot_no_imi?: string}>;
	};
};

const sppbOutRouters = router({
	getPO: procedure.input(zId).query(({ctx, input}) => {
		const {id: id_customer} = input;

		const knb = attrParserV2(dKanban, ["id"]);
		const bin = attrParserV2(dSJIn);
		const po = attrParserV2(dPo);
		const scn = attrParserV2(dScan, ["lot_no_imi", "status"]);
		const scnItem = attrParserV2(dScanItem, ["qty1"]);
		const rejItem = attrParserV2(dRejItem, ["qty1"]);
		const item = attrParserV2(dItem, ["name", "kode_item", "id"]);
		const inItem = attrParserV2(dInItem, [
			"id",
			"qty1",
			"qty2",
			"qty3",
			"lot_no",
		]);
		const outItem = attrParserV2(dOutItem, ["id", "qty1", "qty2", "qty3"]);
		const poItem = attrParserV2(dPoItem, ["id", "unit1", "unit2", "unit3"]);
		const knbItem = attrParserV2(dKnbItem, ["id", "qty1", "qty2", "qty3"]);

		type Ret = typeof po.obj & {
			dSJIns: (typeof bin.obj & {
				dKanbans: (typeof knb.obj & {
					dScans: (typeof scn.obj & {
						dScanItems: typeof scnItem.obj[];
						[dScan._aliasReject]: typeof scn.obj & {
							dScanItems: (typeof scnItem.obj & {
								dRejItems: typeof rejItem.obj[];
							})[];
						};
					})[];
				})[];
				OrmPOItemSppbIns: (typeof inItem.obj & {
					dItem: typeof item.obj;
					dPoItem: typeof poItem.obj;
					dKnbItems: typeof knbItem.obj[];
					dOutItems: typeof outItem.obj[];
				})[];
			})[];
		};

		return checkCredentialV2(ctx, async () => {
			const wherer = wherePagesV3<Ret>({
				"$dSJIns.dKanbans.dScans.status$": "finish_good" as TScanTarget,
				// "$dSJIns.id$": {[Op.not]: null},
				// "$dSJIns.dKanbans.id$": {[Op.not]: null},
			});

			const dataPO = await po.model.findAll({
				logging: true,
				attributes: po.attributes,
				where: {id_customer, ...wherer},
				include: [
					{
						...bin,
						include: [
							{
								...inItem,
								include: [item, poItem, outItem],
							},
							{
								...knb,
								include: [
									knbItem,
									{
										...scn,
										include: [
											scnItem,
											{
												...scn,
												as: dScan._aliasReject,
												include: [{...scnItem, include: [rejItem]}],
											},
										],
									},
								],
							},
						],
					},
				],
			});

			return dataPO.map(e => e.dataValues as Ret);
		});
	}),
	getPOD: procedure.input(zId).query(({ctx, input: {id: id_customer}}) => {
		type UU = typeof Ret;

		const {A, B, C, D, E, F, G, H, I, Ret} = sppbOutGetPoAttributes();

		return checkCredentialV2(ctx, async () => {
			const dataPO = await OrmCustomerPO.findAll({
				attributes: C.keys,
				where: {
					id_customer,
					"$OrmCustomerSPPBIns->OrmKanbans->OrmScans.status_finish_good$": true,
				},
				include: [
					{
						attributes: B.keys,
						model: OrmCustomerSPPBIn,
						include: [
							{
								model: OrmKanban,
								attributes: A.keys,
								include: [
									{model: OrmScan, attributes: D.keys},
									{model: OrmKanbanItem, attributes: I.keys},
								],
							},
							{
								model: OrmPOItemSppbIn,
								attributes: E.keys,
								include: [
									{model: OrmMasterItem, attributes: G.keys},
									{model: OrmCustomerPOItem, attributes: H.keys},
									{
										separate: true,
										attributes: F.keys,
										model: OrmCustomerSPPBOutItem,
									},
								],
							},
						],
					},
				],
			});

			return dataPO.map(e => e.dataValues as UU);
		});
	}),
	getInvoice: procedure.query(() =>
		genInvoice(
			OrmCustomerSPPBOut,
			"SJ/IMI",
			value => value?.invoice_no,
			"invoice_no",
		),
	),
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;
		const {A, B, C, D, E, F, Ret} = sppbOutGetAttributes();

		type RetType = typeof Ret;

		return checkCredentialV2(ctx, async (): Promise<GetPage> => {
			const {count, rows: data} = await OrmCustomerSPPBOut.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
				where: wherePagesV2<RetType>(
					[
						"invoice_no",
						"keterangan",
						"$OrmCustomer.name$",
						"$OrmKendaraan.name$",
					],
					search,
				),
				attributes: B.keys,
				include: [
					{model: OrmKendaraan, attributes: F.keys},
					{model: OrmCustomer, attributes: E.keys},
					{
						model: OrmCustomerSPPBOutItem,
						attributes: A.keys,
						separate: true,
						include: [
							{
								model: OrmPOItemSppbIn,
								attributes: C.keys,
								include: [{attributes: D.keys, model: OrmCustomerSPPBIn}],
							},
						],
					},
				],
			});

			// @ts-ignore
			const allDataSppbIn = data.map<TCustomerSPPBOutUpsert>(e => {
				// @ts-ignore
				const {OrmCustomerSPPBOutItems, ...rest} = e.dataValues as RetType;
				const po = OrmCustomerSPPBOutItems.reduce<TCustomerSPPBOutUpsert["po"]>(
					(ret, cure) => {
						// @ts-ignore
						const {OrmPOItemSppbIn: sppbinItem, id_item, ...cur} =
							// @ts-ignore
							cure?.dataValues as RetType["OrmCustomerSPPBOutItems"][number];
						const id_po = sppbinItem.OrmCustomerSPPBIn.id_po;
						const id_sppb_in = sppbinItem.id_sppb_in;

						const iPo = ret.findIndex(itm => itm.id_po === id_po);

						if (iPo >= 0) {
							const iSppbIn = ret[iPo]!.sppb_in.findIndex(
								f => f.id_sppb_in === id_sppb_in,
							);
							if (iSppbIn >= 0) {
							} else {
								ret[iPo]?.sppb_in;
							}
						} else {
							ret.push({
								id_po,
								sppb_in: [
									{
										id_sppb_in,
										// @ts-ignore
										items: {
											[id_item]: {
												...cur,
												id_item_po: sppbinItem.id_item,
												master_item_id: sppbinItem.master_item_id,
												id: cur.id,
											},
										},
									},
								],
							});
						}
						return ret;
					},
					[],
				);

				return {...rest, po};
			});

			return pagingResult(count, page, limit, allDataSppbIn);
		});
	}),
	getFg: procedure
		.input(z.string().optional())
		.query(({input, ctx: {req, res}}): Promise<GetFGRet[]> => {
			const routerCaller = appRouter.createCaller({req, res});

			return checkCredentialV2({req, res}, async () => {
				const dataScan = await OrmScan.findAll({
					where: {status_finish_good: true, id_customer: input},
					attributes: {
						exclude: [
							"item_produksi",
							"item_qc",
							"status_produksi",
							"status_qc",
						] as (keyof TScan)[],
					},
				});

				const dataScanPromise = dataScan.map(async ({dataValues}) => {
					const [kanban] = await routerCaller.kanban.get({
						type: "kanban",
						where: {id: dataValues.id_kanban},
					});

					return {...dataValues, kanban: {...kanban!}};
				});

				const promisedData = await Promise.all(dataScanPromise);

				return promisedData.reduce((ret, cur) => {
					const index = ret.findIndex(
						e => e.kanban.id_sppb_in === cur.kanban.id_sppb_in,
					);

					if (index < 0) ret.push(calllasl(cur, cur));
					else ret[index] = calllasl(ret[index]!, cur);

					return ret;
				}, [] as GetFGRet[]);

				function calllasl(asd: GetFGRet, cur: GetFGRet): GetFGRet {
					const nextItemsMap = new Map(
						Object.entries(cur.kanban.items).map(([a, b]) => {
							return [a, {...b, lot_no_imi: cur.lot_no_imi}];
						}),
					);
					const prevItems = asd?.kanban.items;
					const nextItems = Object.fromEntries(nextItemsMap);
					const prevListMesin = asd?.kanban.list_mesin;
					const nextListMesin = cur.kanban.list_mesin;
					return {
						...asd,
						...cur,
						kanban: {
							...cur.kanban,
							items: {...prevItems, ...nextItems},
							list_mesin: {...prevListMesin, ...nextListMesin},
						},
					};
				}
			});
		}),
	upsert: procedure
		.input(tCustomerSPPBOutUpsert.partial({id: true}))
		.mutation(({ctx: {req, res}, input}) => {
			return checkCredentialV2({req, res}, async () => {
				const {po, ...rest} = input;
				const [dataSppbOut] = await OrmCustomerSPPBOut.upsert({
					...rest,
					id: input.id ?? generateId("SPPBO_"),
				});

				const items = po.reduce<TCustomerSPPBOutItem[]>((ret, cur) => {
					cur.sppb_in.forEach(bin => {
						Object.entries(bin.items).forEach(([id_item, item]) => {
							ret.push({
								id_item,
								qty1: item.qty1,
								qty2: item.qty2,
								qty3: item.qty3,
								id: item.id ?? generateId("SJOI-"),
								id_sppb_out: dataSppbOut.dataValues.id,
							});
						});
					});
					return ret;
				}, []);

				await OrmCustomerSPPBOutItem.bulkCreate(items, {
					updateOnDuplicate: ["id"],
				});

				return Success;
			});
		}),
	delete: procedure.input(zId).mutation(({ctx: {req, res}, input}) => {
		return checkCredentialV2({req, res}, async () => {
			await OrmCustomerSPPBOut.destroy({where: input});
			await OrmCustomerSPPBOutItem.destroy({where: {id_sppb_out: input.id}});

			return Success;
		});
	}),
});

export default sppbOutRouters;

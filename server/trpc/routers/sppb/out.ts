import {
	KanbanGetRow,
	PagingResult,
	TCustomerSPPBOutItem,
	TCustomerSPPBOutUpsert,
	TKanbanUpsertItem,
} from "@appTypes/app.type";
import {
	tableFormValue,
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tCustomerSPPBOut,
	tCustomerSPPBOutItem,
	tCustomerSPPBOutUpsert,
	tKanban,
	tKanbanItem,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
	tScan,
	TScan,
	zId,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {
	attrParser,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmCustomerSPPBOutItem,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScan,
	wherePagesV2,
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
	getPO: procedure
		.input(tCustomerSPPBOut.pick({id_customer: true}).partial())
		.query(({ctx, input: {id_customer}}) => {
			const A = attrParser(tKanban, ["id"]);
			const B = attrParser(tCustomerSPPBIn);
			const C = attrParser(tCustomerPO);
			const D = attrParser(tScan, [
				"item_finish_good",
				"status_finish_good",
				"lot_no_imi",
			]);
			const E = attrParser(tPOItemSppbIn, [
				"id",
				"qty1",
				"qty2",
				"qty3",
				"lot_no",
			]);
			const F = attrParser(tCustomerSPPBOutItem, [
				"id",
				"qty1",
				"qty2",
				"qty3",
			]);
			const G = attrParser(tMasterItem, ["name", "kode_item", "id"]);
			const H = attrParser(tPOItem, ["id", "unit1", "unit2", "unit3"]);
			const I = attrParser(tKanbanItem, ["id", "qty1", "qty2", "qty3"]);

			type UU = typeof C.obj & {
				OrmCustomerSPPBIns: (typeof B.obj & {
					OrmKanbans: (typeof A.obj & {
						OrmScans: typeof D.obj[];
					})[];
					OrmPOItemSppbIns: (typeof E.obj & {
						OrmCustomerPOItem: typeof H.obj;
						OrmMasterItem: typeof G.obj;
						OrmKanbanItems: typeof I.obj[];
						OrmCustomerSPPBOutItems: (typeof F.obj & {})[];
					})[];
				})[];
			};
			return checkCredentialV2(ctx, async () => {
				const dataPO = await OrmCustomerPO.findAll({
					attributes: C.keys,
					where: {
						id_customer,
						"$OrmCustomerSPPBIns->OrmKanbans->OrmScans.status_finish_good$":
							true,
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
		const {limit, page, search = ""} = input;
		const A = attrParser(tCustomerSPPBOutItem, [
			"id",
			"id_item",
			"qty1",
			"qty2",
			"qty3",
		]);
		const B = attrParser(tCustomerSPPBOut);
		const C = attrParser(tPOItemSppbIn, [
			"id_item",
			"id_sppb_in",
			"master_item_id",
		]);
		const D = attrParser(tCustomerSPPBIn, ["id_po"]);
		const E = attrParser(tCustomer, ["name"]);

		type Ret = typeof B.obj & {
			OrmCustomer: typeof E.obj;
			OrmCustomerSPPBOutItems: (typeof A.obj & {
				OrmPOItemSppbIn: typeof C.obj & {
					OrmCustomerSPPBIn: typeof D.obj;
				};
			})[];
		};

		return checkCredentialV2(ctx, async (): Promise<GetPage> => {
			const {count, rows: data} = await OrmCustomerSPPBOut.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
				where: wherePagesV2<Ret>(["invoice_no", "$OrmCustomer.name$"], search),
				attributes: B.keys,
				logging: true,
				include: [
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
				const {OrmCustomerSPPBOutItems, ...rest} = e.dataValues as Ret;
				const po = OrmCustomerSPPBOutItems.reduce<TCustomerSPPBOutUpsert["po"]>(
					(ret, cure) => {
						const {OrmPOItemSppbIn, id_item, ...cur} =
							// @ts-ignore
							cure?.dataValues as Ret["OrmCustomerSPPBOutItems"][number];
						const id_po = OrmPOItemSppbIn.OrmCustomerSPPBIn.id_po;
						const id_sppb_in = OrmPOItemSppbIn.id_sppb_in;

						const iPo = ret.findIndex(e => e.id_po === id_po);

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
												id_item_po: OrmPOItemSppbIn.id_item,
												master_item_id: OrmPOItemSppbIn.master_item_id,
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

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
	getPOSppbOutAttributes,
	OrmCustomer,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmCustomerSPPBOutItem,
	OrmKendaraan,
	OrmPOItemSppbIn,
	OrmScan,
	sppbOutGetAttributes,
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
		type RetOutput = typeof Ret;
		const {id: id_customer} = input;

		const {po, sjInInclude, Ret} = getPOSppbOutAttributes();

		return checkCredentialV2(ctx, async () => {
			const wherer = wherePagesV3<RetOutput>({
				"$dSJIns.dKanbans.dScans.status$": "finish_good" as TScanTarget,
			});

			const dataPO = await po.model.findAll({
				attributes: po.attributes,
				where: {id_customer, ...wherer},
				include: [sjInInclude],
			});

			return dataPO.map(e => e.toJSON() as unknown as RetOutput);
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

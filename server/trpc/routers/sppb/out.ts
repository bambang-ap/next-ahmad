import {
	KanbanGetRow,
	PagingResult,
	TCustomer,
	TKanbanUpsertItem,
	TKendaraan,
} from "@appTypes/app.type";
import {
	tableFormValue,
	tCustomerPO,
	tCustomerSPPBIn,
	TCustomerSPPBOut,
	tCustomerSPPBOut,
	tCustomerSPPBOutItem,
	tCustomerSPPBOutSppbIn,
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
	OrmKendaraan,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScan,
} from "@database";
import {checkCredentialV2, generateId, genInvoice, pagingResult} from "@server";
import {procedure, router} from "@trpc";

import {literal, Op} from "sequelize";
import {z} from "zod";

import {appRouter} from "..";

type A = z.infer<typeof a>;
const a = z
	.object({
		id_po: z.string(),
		sppb_in: tCustomerSPPBOutSppbIn
			.extend({dataSppbIn: tCustomerSPPBIn.nullish()})
			.array(),
		dataPo: tCustomerPO.nullish(),
	})
	.array();

type GetPage = PagingResult<TCustomerSPPBOut>;
export type GetFGRet = TScan & {
	kanban: Omit<KanbanGetRow, "items"> & {
		items: MyObject<TKanbanUpsertItem & {lot_no_imi?: string}>;
	};
};
type KJ = Omit<TCustomerSPPBOut, "po"> & {
	OrmKendaraan: TKendaraan;
	OrmCustomer: TCustomer;
	po: A;
};

const A = attrParser(tKanban, ["id"]);
const B = attrParser(tCustomerSPPBIn);
const C = attrParser(tCustomerPO);
const D = attrParser(tScan, [
	"item_finish_good",
	"status_finish_good",
	"lot_no_imi",
]);
const E = attrParser(tPOItemSppbIn, ["qty1", "qty2", "qty3", "lot_no"]);
const F = attrParser(tCustomerSPPBOutItem, ["qty1", "qty2", "qty3"]);
const G = attrParser(tMasterItem, ["name", "kode_item", "id"]);
const H = attrParser(tPOItem, ["id", "unit1", "unit2", "unit3"]);
const I = attrParser(tKanbanItem, ["id", "qty1", "qty2", "qty3"]);

export type UU = typeof C.obj & {
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

const sppbOutRouters = router({
	getPOO: procedure
		.input(tCustomerSPPBOut.pick({id_customer: true}).partial())
		.query(({ctx, input: {id_customer}}) => {
			return checkCredentialV2(ctx, async () => {
				const itemFg = literal("item_finish_good->0");

				const dataFgg = await OrmCustomerPO.findAll({
					logging: true,
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
										{model: OrmCustomerSPPBOutItem, attributes: F.keys},
										{model: OrmMasterItem, attributes: G.keys},
										{model: OrmCustomerPOItem, attributes: H.keys},
									],
								},
							],
						},
					],
				});

				return dataFgg.map(e => {
					const val = e.dataValues as UU;

					return val;
				});
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
	getDetail: procedure.input(z.string()).query(({ctx, input}) => {
		// const routerCaller = appRouter.createCaller(ctx);
		return checkCredentialV2(ctx, async (): Promise<KJ> => {
			const data = (await OrmCustomerSPPBOut.findOne({
				where: {id: input},
				include: [OrmCustomer, OrmKendaraan],
			}))!;

			const detailPo = data.dataValues.po.map(async ({id_po, sppb_in}) => {
				const dataPo = await OrmCustomerPO.findOne({where: {id: id_po}});

				const dataSppbIn = sppb_in.map(async ({id_sppb_in, items}) => {
					const sppbInData = await OrmCustomerSPPBIn.findOne({
						where: {id: id_sppb_in},
					});

					const kanban = await OrmKanban.findOne({
						attributes: ["id"],
						where: {id_sppb_in},
					});

					const lot_no_imi = (
						await OrmScan.findOne({where: {id_kanban: kanban?.dataValues.id}})
					)?.dataValues.lot_no_imi;

					return {
						items,
						id_sppb_in,
						lot_no_imi,
						dataSppbIn: sppbInData?.dataValues,
					};
				});

				return {
					id_po,
					sppb_in: await Promise.all(dataSppbIn),
					dataPo: dataPo?.dataValues,
				};
			});

			// @ts-ignore
			return {
				...data?.dataValues,
				po: await Promise.all(detailPo),
			};
		});
	}),
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search = ""} = input;
		return checkCredentialV2(ctx, async (): Promise<GetPage> => {
			const {count, rows: data} = await OrmCustomerSPPBOut.findAndCountAll({
				limit,
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				where: {invoice_no: {[Op.iLike]: `%${search}%`}},
				// where: wherePages([""], search),
			});
			const allDataSppbIn = data.map(e => e.dataValues);

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
		.input(tCustomerSPPBOut.partial({id: true}))
		.mutation(({ctx: {req, res}, input}) => {
			return checkCredentialV2({req, res}, async () => {
				await OrmCustomerSPPBOut.upsert({
					...input,
					id: input.id ?? generateId("SPPBO_"),
				});

				return Success;
			});
		}),
	delete: procedure.input(zId).mutation(({ctx: {req, res}, input}) => {
		return checkCredentialV2({req, res}, async () => {
			await OrmCustomerSPPBOut.destroy({where: input});

			return Success;
		});
	}),
});

export default sppbOutRouters;

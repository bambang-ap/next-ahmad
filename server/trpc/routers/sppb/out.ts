// FIXME:
// @ts-nocheck

import {
	KanbanGetRow,
	PagingResult,
	TCustomer,
	TKendaraan,
} from "@appTypes/app.type";
import {
	tableFormValue,
	tCustomerPO,
	tCustomerSPPBIn,
	TCustomerSPPBOut,
	tCustomerSPPBOut,
	tCustomerSPPBOutSppbIn,
	TScan,
	zId,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmKanban,
	OrmKendaraan,
	OrmScan,
} from "@database";
import {checkCredentialV2, generateId, genInvoice, pagingResult} from "@server";
import {procedure, router} from "@trpc";

import {Op} from "sequelize";
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
type YY = TScan & {kanban: KanbanGetRow};
type KJ = Omit<TCustomerSPPBOut, "po"> & {
	OrmKendaraan: TKendaraan;
	OrmCustomer: TCustomer;
	po: A;
};

const sppbOutRouters = router({
	getInvoice: procedure.query(() => genInvoice(OrmCustomerSPPBOut, "SJ/IMI")),
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
		.query(({input, ctx: {req, res}}): Promise<YY[]> => {
			const routerCaller = appRouter.createCaller({req, res});

			return checkCredentialV2({req, res}, async () => {
				const dataScan = await OrmScan.findAll({
					where: {status_finish_good: true, id_customer: input},
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

					if (index < 0) ret.push(cur);
					else {
						const prevItems = ret[index]?.kanban.items;
						const nextItems = cur.kanban.items;
						const prevListMesin = ret[index]?.kanban.list_mesin;
						const nextListMesin = cur.kanban.list_mesin;
						ret[index] = {
							...ret[index],
							...cur,
							kanban: {
								...cur.kanban,
								items: {...prevItems, ...nextItems},
								list_mesin: {...prevListMesin, ...nextListMesin},
							},
						};
					}

					return ret;
				}, [] as YY[]);
			});
		}),
	upsert: procedure
		.input(tCustomerSPPBOut.partial({id: true}))
		.mutation(({ctx: {req, res}, input}) => {
			return checkCredentialV2({req, res}, async () => {
				await OrmCustomerSPPBOut.upsert({
					...input,
					id: input.id ?? generateId("SPPBO"),
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

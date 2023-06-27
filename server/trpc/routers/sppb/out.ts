import {
	KanbanGetRow,
	PagingResult,
	TCustomer,
	TKendaraan,
} from "@appTypes/app.type";
import {
	tableFormValue,
	TCustomerSPPBOut,
	tCustomerSPPBOut,
	TScan,
	zId,
} from "@appTypes/app.zod";
import {
	OrmCustomer,
	OrmCustomerSPPBOut,
	OrmKendaraan,
	OrmScan,
} from "@database";
import {checkCredentialV2, generateId, genInvoice, pagingResult} from "@server";
import {procedure, router} from "@trpc";

import {Op} from "sequelize";
import {z} from "zod";

import {appRouter} from "..";

type GetPage = PagingResult<TCustomerSPPBOut>;
type YY = TScan & {kanban: KanbanGetRow};

const sppbOutRouters = router({
	getInvoice: procedure.query(() => genInvoice(OrmCustomerSPPBOut, "SJ/IMI")),
	getDetail: procedure.input(z.string()).query(({ctx, input}) => {
		// const routerCaller = appRouter.createCaller(ctx);
		return checkCredentialV2(
			ctx,
			async (): Promise<
				TCustomerSPPBOut & {
					data: {customer?: TCustomer; kendaraan?: TKendaraan};
				}
			> => {
				const data = (await OrmCustomerSPPBOut.findOne({where: {id: input}}))!;
				// @ts-ignore
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const {id_customer, id_kendaraan, po: listPo} = data?.dataValues!;

				const customer = (await OrmCustomer.findOne({where: {id: id_customer}}))
					?.dataValues;
				const kendaraan = (
					await OrmKendaraan.findOne({where: {id: id_kendaraan}})
				)?.dataValues;

				return {
					...data?.dataValues,
					data: {customer, kendaraan},
				};
			},
		);
	}),
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search = ""} = input;
		return checkCredentialV2(ctx, async (): Promise<GetPage> => {
			const {count, rows: data} = await OrmCustomerSPPBOut.findAndCountAll({
				where: {invoice_no: {[Op.iLike]: `%${search}%`}},
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

				return {message: "Success"};
			});
		}),
	delete: procedure.input(zId).mutation(({ctx: {req, res}, input}) => {
		return checkCredentialV2({req, res}, async () => {
			await OrmCustomerSPPBOut.destroy({where: input});

			return {message: "Success"};
		});
	}),
});

export default sppbOutRouters;

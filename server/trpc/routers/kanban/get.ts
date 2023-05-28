import {z} from "zod";

import {
	AppRouterCaller,
	KanbanGetRow,
	PagingResult,
	TKanban,
	TMasterItem,
	TMesin,
} from "@appTypes/app.type";
import {tableFormValue, tKanban} from "@appTypes/app.zod";
import {ItemDetail} from "@appTypes/props.type";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmDocument,
	OrmKanban,
	OrmKanbanItem,
	OrmKategoriMesin,
	OrmMasterItem,
	OrmMesin,
	OrmUser,
	wherePages,
} from "@database";
import {checkCredentialV2, pagingResult} from "@server";
import {procedure} from "@trpc";
import {appRouter} from "@trpc/routers";

export const kanbanGet = {
	availableMesins: procedure.input(z.string()).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async (): Promise<TMesin[]> => {
			const mesins = await OrmMesin.findAll({where: {kategori_mesin: input}});
			return mesins.map(e => e.dataValues);
		});
	}),
	itemDetail: procedure
		.input(z.string().or(z.string().array()))
		.query(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				if (!Array.isArray(input)) {
					const listMasterItem = await OrmMasterItem.findOne({
						where: {id: input},
						include: [OrmKategoriMesin],
					});

					return parseItem(listMasterItem?.dataValues);
				}

				const listMasterItem = await OrmMasterItem.findAll({
					where: {id: input},
					include: [OrmKategoriMesin],
				});

				return Promise.all(listMasterItem.map(e => parseItem(e.dataValues)));

				async function parseItem(data?: TMasterItem) {
					const item = data as ItemDetail;
					const availableMesins = (
						await OrmMesin.findAll({
							where: {kategori_mesin: item?.OrmKategoriMesin.id},
						})
					).map(e => e.dataValues);

					return {...item, availableMesins};
				}
			});
		}),
	detail: procedure.input(z.string()).query(({ctx, input: id}) => {
		const routerCaller = appRouter.createCaller(ctx);

		return checkCredentialV2(ctx, async (): Promise<KanbanGetRow | null> => {
			const dataKanban = await OrmKanban.findOne({
				where: {id},
				include: [
					{model: OrmDocument},
					{model: OrmCustomerPO, include: [OrmCustomer]},
					{model: OrmUser, as: OrmKanban._aliasCreatedBy},
					{model: OrmUser, as: OrmKanban._aliasUpdatedBy},
				],
			});

			if (!dataKanban) return null;

			return parseDetailKanban(dataKanban.dataValues, routerCaller);
		});
	}),
	getPage: procedure.input(tableFormValue).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async (): Promise<PagingResult<TKanban>> => {
			const {limit, page, search} = input;

			const {count, rows} = await OrmKanban.findAndCountAll({
				limit,
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				where: wherePages("nomor_kanban", search),
			});

			return pagingResult(
				count,
				page,
				limit,
				rows.map(e => e.dataValues),
			);
		});
	}),
	get: procedure
		.input(
			z.object({
				type: z.literal("kanban"),
				where: tKanban.partial().optional(),
			}),
		)
		.query(({ctx: {req, res}, input: {where}}) => {
			const routerCaller = appRouter.createCaller({req, res});
			return checkCredentialV2(
				{req, res},
				async (): Promise<KanbanGetRow[]> => {
					const dataKanban = await OrmKanban.findAll({
						where,
						limit: 5,
						attributes: ["id"],
						order: [["createdAt", "asc"]],
					});
					const detailedKanban = await Promise.all(
						dataKanban.map(e => routerCaller.kanban.detail(e.dataValues.id)),
					);

					return detailedKanban.filter(Boolean);
				},
			);
		}),
};

async function parseDetailKanban(
	dataValues: TKanban,
	routerCaller: AppRouterCaller,
) {
	const {id_sppb_in} = dataValues;

	const dataItems = await OrmKanbanItem.findAll({
		where: {id_kanban: dataValues.id},
		include: [OrmMasterItem],
	});
	const dataSppbIn = await routerCaller.sppb.in.get({
		type: "sppb_in",
		where: {id: id_sppb_in},
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// const {image, ...restDataValues} = dataValues;
	const {...restDataValues} = dataValues;

	const objectData: KanbanGetRow = {
		...restDataValues,
		dataSppbIn: dataSppbIn.find(e => e.id === id_sppb_in),
		get id_customer() {
			return this.OrmCustomerPO?.id_customer;
		},
		get items() {
			return dataItems.reduce((ret, e) => {
				// @ts-ignore
				ret[e.dataValues.id_item] = {
					...e.dataValues,
					id_sppb_in: this.dataSppbIn?.id,
				};
				return ret;
			}, {} as KanbanGetRow["items"]);
		},
	};

	return objectData;
}

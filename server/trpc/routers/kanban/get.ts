import {z} from "zod";

import {
	AppRouterCaller,
	KanbanGetRow,
	PagingResult,
	TKanban,
	TMasterItem,
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
		const routerCaller = appRouter.createCaller(ctx);

		return checkCredentialV2(
			ctx,
			async (): Promise<PagingResult<KanbanGetRow>> => {
				const {limit, page, search} = input;

				const {count, rows} = await OrmKanban.findAndCountAll({
					limit,
					order: [["id", "asc"]],
					offset: (page - 1) * limit,
					where: wherePages("id", search),
					attributes: ["id"],
				});

				const detailedKanban = await Promise.all(
					rows.map(e => routerCaller.kanban.detail(e.dataValues.id)),
				);

				return pagingResult(count, page, limit, detailedKanban.filter(Boolean));
			},
		);
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
	const {id_po, id_sppb_in, createdBy, updatedBy, list_mesin, doc_id} =
		dataValues;

	const dataItems = await OrmKanbanItem.findAll({
		where: {id_kanban: dataValues.id},
	});
	const dataSppbIn = await routerCaller.sppb.in.get({
		type: "sppb_in",
		where: {id: id_sppb_in},
	});

	// const listMesin = await Promise.all(
	// 	list_mesin.map(async mesin => {
	// 		const dataMesin = await OrmMesin.findOne({
	// 			where: {id: mesin.id_mesin},
	// 		});

	// 		const instruksi = mesin.instruksi.map(async instruksi => {
	// 			const dataInstruksi = await OrmKanbanInstruksi.findOne({
	// 				where: {id: instruksi.id_instruksi},
	// 			});

	// 			const parameterData = instruksi.parameter.map(async id => {
	// 				const data = await OrmParameter.findOne({where: {id}});
	// 				const kategori = await OrmParameterKategori.findOne({
	// 					where: {id: data?.dataValues.id_kategori},
	// 				});
	// 				return {
	// 					...data?.dataValues,
	// 					kategori: kategori?.dataValues,
	// 				};
	// 			});
	// 			const materialData = instruksi.material.map(async id => {
	// 				const data = await OrmMaterial.findOne({where: {id}});
	// 				const kategori = await OrmMaterialKategori.findOne({
	// 					where: {id: data?.dataValues.id_kategori},
	// 				});
	// 				return {
	// 					...data?.dataValues,
	// 					kategori: kategori?.dataValues,
	// 				};
	// 			});
	// 			const hardnessData = instruksi.hardness.map(async id => {
	// 				const data = await OrmHardness.findOne({where: {id}});
	// 				const kategori = await OrmHardnessKategori.findOne({
	// 					where: {id: data?.dataValues.id_kategori},
	// 				});
	// 				return {
	// 					...data?.dataValues,
	// 					kategori: kategori?.dataValues,
	// 				};
	// 			});

	// 			return {
	// 				dataInstruksi: dataInstruksi?.dataValues,
	// 				parameter: await Promise.all(parameterData),
	// 				material: await Promise.all(materialData),
	// 				hardness: await Promise.all(hardnessData),
	// 			};
	// 		});

	// 		return {
	// 			dataMesin: dataMesin?.dataValues,
	// 			instruksi: await Promise.all(instruksi),
	// 		};
	// 	}),
	// );

	const {image, ...restDataValues} = dataValues;

	const objectData: KanbanGetRow = {
		...restDataValues,
		dataSppbIn: dataSppbIn.find(e => e.id === id_sppb_in),
		get id_customer() {
			return this.dataPo?.id_customer;
		},
		get items() {
			return dataItems.reduce<KanbanGetRow["items"]>((ret, e) => {
				ret[e.dataValues.id_item] = {
					...e.dataValues,
					id_sppb_in: this.dataSppbIn?.id,
				};
				return ret;
			}, {});
		},
	};

	return objectData;
}

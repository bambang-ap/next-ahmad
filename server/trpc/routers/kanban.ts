import {Op} from 'sequelize';
import {z} from 'zod';

import {KanbanGetRow} from '@appTypes/app.type';
import {tKanban, TKanban, tKanbanUpsert, TUser} from '@appTypes/app.zod';
import {
	OrmHardness,
	OrmHardnessKategori,
	OrmKanban,
	OrmKanbanInstruksi,
	OrmKanbanItem,
	OrmMaterial,
	OrmMaterialKategori,
	OrmMesin,
	OrmParameter,
	OrmParameterKategori,
	OrmScan,
	OrmUser,
} from '@database';
import {checkCredentialV2, generateId} from '@server';
import {procedure, router} from '@trpc';
import {appRouter} from '@trpc/routers';
import {TRPCError} from '@trpc/server';

const kanbanRouters = router({
	images: procedure.query(({ctx: {req, res}}) => {
		return checkCredentialV2(req, res, async () => {
			const images = await OrmKanban.findAll({
				where: {image: {[Op.ne]: null}},
				attributes: ['image', 'keterangan'] as (keyof TKanban)[],
			});

			return images?.map(({dataValues}) => {
				const {image, keterangan} = dataValues;

				return {image, keterangan};
			});
		});
	}),
	get: procedure
		.input(
			z.object({
				type: z.literal('kanban'),
				where: tKanban.partial().optional(),
			}),
		)
		.query(({ctx: {req, res}, input: {where}}) => {
			const routerCaller = appRouter.createCaller({req, res});
			return checkCredentialV2(req, res, async (): Promise<KanbanGetRow[]> => {
				const dataKanban = await OrmKanban.findAll({
					where,
					order: [['createdAt', 'asc']],
				});
				const kanbanDetailPromses = dataKanban.map(async ({dataValues}) => {
					const {id_po, id_sppb_in, createdBy, updatedBy, list_mesin} =
						dataValues;

					// @ts-ignore
					const [dataCreatedBy, dataUpdatedBy]: [TUser, TUser] = (
						await Promise.all([
							OrmUser.findOne({where: {id: createdBy}}),
							OrmUser.findOne({where: {id: updatedBy}}),
						])
					).map(e => e?.dataValues);

					const dataItems = await OrmKanbanItem.findAll({
						where: {id_kanban: dataValues.id},
					});
					const dataSppbIn = await routerCaller.sppb.in.get({
						type: 'sppb_in',
						where: {id: id_sppb_in},
					});
					const dataPo = await routerCaller.customer_po.get({
						type: 'customer_po',
						id: id_po,
					});

					const listMesin = await Promise.all(
						list_mesin.map(async mesin => {
							const dataMesin = await OrmMesin.findOne({
								where: {id: mesin.id_mesin},
							});

							const instruksi = mesin.instruksi.map(async instruksi => {
								const dataInstruksi = await OrmKanbanInstruksi.findOne({
									where: {id: instruksi.id_instruksi},
								});

								const parameterData = instruksi.parameter.map(async id => {
									const data = await OrmParameter.findOne({where: {id}});
									const kategori = await OrmParameterKategori.findOne({
										where: {id: data?.dataValues.id_kategori},
									});
									return {...data?.dataValues, kategori: kategori?.dataValues};
								});
								const materialData = instruksi.material.map(async id => {
									const data = await OrmMaterial.findOne({where: {id}});
									const kategori = await OrmMaterialKategori.findOne({
										where: {id: data?.dataValues.id_kategori},
									});
									return {...data?.dataValues, kategori: kategori?.dataValues};
								});
								const hardnessData = instruksi.hardness.map(async id => {
									const data = await OrmHardness.findOne({where: {id}});
									const kategori = await OrmHardnessKategori.findOne({
										where: {id: data?.dataValues.id_kategori},
									});
									return {...data?.dataValues, kategori: kategori?.dataValues};
								});

								return {
									dataInstruksi: dataInstruksi?.dataValues,
									parameter: await Promise.all(parameterData),
									material: await Promise.all(materialData),
									hardness: await Promise.all(hardnessData),
								};
							});

							return {
								dataMesin: dataMesin?.dataValues,
								instruksi: await Promise.all(instruksi),
							};
						}),
					);

					const objectData: KanbanGetRow = {
						...dataValues,
						// @ts-ignore
						listMesin,
						dataCreatedBy,
						dataUpdatedBy,
						dataSppbIn: dataSppbIn.find(e => e.id === id_sppb_in),
						dataPo: dataPo.find(e => e.id === id_po),
						get id_customer() {
							return this.dataPo?.id_customer;
						},
						get items() {
							return dataItems.reduce<KanbanGetRow['items']>((ret, e) => {
								ret[e.dataValues.id_item] = {
									...e.dataValues,
									id_sppb_in: this.dataSppbIn?.id,
								};
								return ret;
							}, {});
						},
					};

					return objectData;
				});

				return Promise.all(kanbanDetailPromses);
			});
		}),

	upsert: procedure
		.input(tKanbanUpsert)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async session => {
				const {id, items: kanban_items, createdBy, ...rest} = input;
				const [createdKanban] = await OrmKanban.upsert({
					...rest,
					createdBy: createdBy ?? session.user?.id!,
					updatedBy: session.user?.id!,
					id: id || generateId(),
				});

				await OrmScan.findOrCreate({
					where: {id_kanban: createdKanban.dataValues.id},
					defaults: {id_kanban: createdKanban.dataValues.id, id: generateId()},
					logging: true,
				});

				const itemPromises = Object.entries(kanban_items)?.map(
					([id_item, {id: idItemKanban, id_sppb_in, ...restItemKanban}]) => {
						if (id_sppb_in !== rest.id_sppb_in) return null;

						return OrmKanbanItem.upsert({
							...restItemKanban,
							id_item,
							id: idItemKanban ?? generateId(),
							id_kanban: createdKanban.dataValues.id,
						});
					},
				);
				await Promise.all(itemPromises);
				return {message: 'Success'};
			});
		}),

	delete: procedure
		.input(z.string().optional())
		.mutation(async ({input: id, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				if (!id) {
					throw new TRPCError({code: 'BAD_REQUEST', message: 'ID is required'});
				}

				await OrmScan.destroy({where: {id_kanban: id}});
				await OrmKanbanItem.destroy({where: {id_kanban: id}});
				await OrmKanban.destroy({where: {id}});

				return {message: 'Success'};
			});
		}),
	deleteItem: procedure
		.input(z.string().optional())
		.mutation(async ({input: id, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				if (!id) {
					throw new TRPCError({code: 'BAD_REQUEST', message: 'ID is required'});
				}

				await OrmKanbanItem.destroy({where: {id}});

				return {message: 'Success'};
			});
		}),
});

export default kanbanRouters;

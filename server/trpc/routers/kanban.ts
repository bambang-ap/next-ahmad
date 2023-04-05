import {Op} from 'sequelize';
import {z} from 'zod';

import {
	THardness,
	TInstruksiKanban,
	tKanban,
	TKanban,
	TKanbanUpsert,
	tKanbanUpsert,
	TMaterial,
	TMesin,
	TParameter,
	TUser,
} from '@appTypes/app.zod';
import {
	OrmHardness,
	OrmKanban,
	OrmKanbanInstruksi,
	OrmKanbanItem,
	OrmMaterial,
	OrmMesin,
	OrmParameter,
	OrmScan,
	OrmUser,
} from '@database';
import {checkCredentialV2, generateId} from '@server';
import {procedure, router} from '@trpc';
import {appRouter, RouterOutput} from '@trpc/routers';
import {TRPCError} from '@trpc/server';
import toArraySchema from '@utils/zod';

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
				where: z
					.object(
						toArraySchema(
							tKanban.omit({list_mesin: true, image: true}).required(),
						),
					)
					.partial()
					.or(tKanban.partial())
					.optional(),
			}),
		)
		.query(({ctx: {req, res}, input: {where}}) => {
			type TType = TKanban & {
				id_customer?: string;
				items: TKanbanUpsert['items'];
				dataSppbIn?: RouterOutput['sppb']['get'][number];
				dataPo?: RouterOutput['customer_po']['get'][number];
				dataCreatedBy?: TUser;
				dataUpdatedBy?: TUser;
				listMesin?: {
					dataMesin?: TMesin;
					instruksi?: {
						dataInstruksi?: TInstruksiKanban;
						parameterData: (TParameter | undefined)[];
						materialData: (TMaterial | undefined)[];
						hardnessData: (THardness | undefined)[];
					}[];
				}[];
			};
			const routerCaller = appRouter.createCaller({req, res});
			return checkCredentialV2(req, res, async (): Promise<TType[]> => {
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
					const dataSppbIn = await routerCaller.sppb.get({
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
									return data?.dataValues;
								});
								const materialData = instruksi.material.map(async id => {
									const data = await OrmMaterial.findOne({where: {id}});
									return data?.dataValues;
								});
								const hardnessData = instruksi.hardness.map(async id => {
									const data = await OrmHardness.findOne({where: {id}});
									return data?.dataValues;
								});

								return {
									dataInstruksi: dataInstruksi?.dataValues,
									parameterData: await Promise.all(parameterData),
									materialData: await Promise.all(materialData),
									hardnessData: await Promise.all(hardnessData),
								};
							});

							return {
								dataMesin: dataMesin?.dataValues,
								instruksi: await Promise.all(instruksi),
							};
						}),
					);

					const objectData: TType = {
						...dataValues,
						listMesin,
						dataCreatedBy,
						dataUpdatedBy,
						dataSppbIn: dataSppbIn.find(e => e.id === id_sppb_in),
						dataPo: dataPo.find(e => e.id === id_po),
						get id_customer() {
							return this.dataPo?.id_customer;
						},
						get items() {
							return dataItems.reduce<TType['items']>((ret, e) => {
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

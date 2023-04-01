import {z} from 'zod';

import {
	THardness,
	TInstruksiKanban,
	tKanban,
	TKanban,
	TKanbanUpsert,
	tKanbanUpsert,
	TMesin,
	TParameter,
	TUser,
} from '@appTypes/app.zod';
import {
	OrmHardness,
	OrmKanban,
	OrmKanbanInstruksi,
	OrmKanbanItem,
	OrmMesin,
	OrmParameter,
	OrmScan,
	OrmUser,
} from '@database';
import {checkCredentialV2, generateId} from '@server';
import {procedure, router} from '@trpc';
import {appRouter, RouterOutput} from '@trpc/routers';
import {TRPCError} from '@trpc/server';

const kanbanRouters = router({
	get: procedure
		.input(
			z.object({
				type: z.literal('kanban'),
				where: tKanban.partial().optional(),
			}),
		)
		.query(({ctx: {req, res}, input: {where}}) => {
			type TType = TKanban & {
				id_customer?: string;
				items: TKanbanUpsert['items'];
				dataMesin: (TMesin & {dataInstruksi: TInstruksiKanban[]})[];
				dataSppbIn?: RouterOutput['sppb']['get'][number];
				dataPo?: RouterOutput['customer_po']['get'][number];
				dataHardness?: THardness;
				dataParameter?: TParameter;
				dataCreatedBy?: TUser;
				dataUpdatedBy?: TUser;
			};
			const routerCaller = appRouter.createCaller({req, res});
			return checkCredentialV2(req, res, async (): Promise<TType[]> => {
				const dataKanban = await OrmKanban.findAll({where});
				const kanbanDetailPromses = dataKanban.map(async ({dataValues}) => {
					const {
						mesin_id,
						instruksi_id,
						id_po,
						id_sppb_in,
						hardnessId,
						parameterId,
						createdBy,
						updatedBy,
					} = dataValues;

					const [dataHardness, dataParameter, dataCreatedBy, dataUpdatedBy]: [
						THardness,
						TParameter,
						TUser,
						TUser,
					] = (
						await Promise.all([
							OrmHardness.findOne({where: {id: hardnessId}}),
							OrmParameter.findOne({where: {id: parameterId}}),
							OrmUser.findOne({where: {id: createdBy}}),
							OrmUser.findOne({where: {id: updatedBy}}),
						])
					).map(e => e?.dataValues);

					const dataItems = await OrmKanbanItem.findAll({
						where: {id_kanban: dataValues.id},
					});
					const dataMesin = await OrmMesin.findAll({where: {id: mesin_id}});
					const dataSppbIn = await routerCaller.sppb.get({
						type: 'sppb_in',
						where: {id: id_sppb_in},
					});
					const dataPo = await routerCaller.customer_po.get({
						type: 'customer_po',
						id: id_po,
					});
					const dataMesinPromises = dataMesin.map(
						async ({dataValues: mesin}) => {
							const id_instruksi = instruksi_id[mesin.id] ?? [];
							const dataInstruksi = await OrmKanbanInstruksi.findAll({
								where: {id: id_instruksi},
							});
							return {
								...mesin,
								dataInstruksi: dataInstruksi.map(e => e.dataValues),
							};
						},
					);

					const objectData: TType = {
						...dataValues,
						dataHardness,
						dataParameter,
						dataCreatedBy,
						dataUpdatedBy,
						dataMesin: await Promise.all(dataMesinPromises),
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

				await OrmScan.create({
					id_kanban: createdKanban.dataValues.id,
					id: generateId(),
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

import {z} from 'zod';

import {tCustomerPO, tKanbanUpsert} from '@appTypes/app.zod';
import {
	OrmKanban,
	OrmKanbanInstruksi,
	OrmKanbanItem,
	OrmMesin,
	OrmScan,
} from '@database';
import {checkCredentialV2, generateId} from '@server';
import {procedure, router} from '@trpc';

const kanbanRouters = router({
	get: procedure
		.input(z.object({type: z.literal('kanban')}))
		.query(({ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const dataKanban = await OrmKanban.findAll();
				const kanbanDetailPromses = dataKanban.map(async ({dataValues}) => {
					const {mesin_id, instruksi_id} = dataValues;
					const dataMesin = await OrmMesin.findAll({where: {id: mesin_id}});

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

					return {
						...dataValues,
						dataMesin: await Promise.all(dataMesinPromises),
					};
				});

				return Promise.all(kanbanDetailPromses);
			});
		}),

	upsert: procedure
		.input(tKanbanUpsert)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {id, items: kanban_items, ...rest} = input;
				const [createdKanban] = await OrmKanban.upsert({
					...rest,
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
		.input(tCustomerPO.pick({id: true}))
		.mutation(async ({input: {id}, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				await OrmScan.destroy({where: {id_kanban: id}});
				await OrmKanban.destroy({where: {id}});
				return {message: 'Success'};
			});
		}),
});

export default kanbanRouters;

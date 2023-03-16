import {z} from 'zod';

import {TKanbanExtended} from '@appTypes/app.type';
import {
	tCustomerPO,
	TCustomerSPPBIn,
	tKanban,
	tKanbanUpsert,
} from '@appTypes/app.zod';
import {OrmKanban, OrmScan} from '@database';
import {CRUD_ENABLED} from '@enum';
import {checkCredentialV2, generateId} from '@server';
import {procedure, router} from '@trpc';
import {appRouter} from '@trpc/routers';

const kanbanRouters = router({
	get get() {
		return procedure
			.input(
				z.object({
					type: z.literal('kanban'),
					where: tKanban.deepPartial().optional(),
				}),
			)
			.query(async ({input: {where}, ctx: {req, res}}) => {
				type RetType = TKanbanExtended & {sppbin?: TCustomerSPPBIn[]};
				return checkCredentialV2(req, res, async (): Promise<RetType[]> => {
					const routerCaller = appRouter.createCaller({req, res});
					const allPO = await OrmKanban.findAll({
						where,
						order: [
							['createdAt', 'asc'],
							['nomor_po', 'asc'],
						],
					});
					// @ts-ignore
					const joinedPOPromises = (allPO as TKanban[]).map<Promise<RetType>>(
						async item => {
							const {nomor_po, id_instruksi_kanban, id_mesin} = item;
							const po = await routerCaller.customer_po.get({
								nomor_po,
								type: 'customer_po',
							});
							const instruksi_kanban = await routerCaller.basic.get({
								where: {id: id_instruksi_kanban},
								target: CRUD_ENABLED.INSTRUKSI_KANBAN,
							});
							const mesin = await routerCaller.basic.get({
								where: {id: id_mesin},
								target: CRUD_ENABLED.MESIN,
							});
							const sppbin = await routerCaller.basic.get({
								where: {nomor_po},
								target: CRUD_ENABLED.CUSTOMER_SPPB_IN,
							});

							return {
								...item,
								id_po: nomor_po,
								instruksi_kanban,
								mesin,
								po,
								sppbin,
							};
						},
					);

					const joinedPO = await Promise.all(joinedPOPromises);

					return joinedPO;
				});
			});
	},

	upsert: procedure
		.input(tKanbanUpsert)
		.query(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {id, kanban_items, ...rest} = input;
				const [createdKanban] = await OrmKanban.upsert({
					...rest,
					id: id ?? generateId(),
				});
				await OrmScan.create({
					id_kanban: createdKanban.dataValues.id,
					id: generateId(),
				});
				const itemPromises = kanban_items.map(item => {});
				await Promise.all(itemPromises);
				return {message: 'Success'};
			});
		}),

	add: procedure
		.input(tKanban.omit({id: true}))
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const id_kanban = generateId();
				await OrmKanban.create({...input, id: id_kanban});
				await OrmScan.create({id_kanban, id: generateId()});
				return {message: 'Success'};
			});
		}),

	update: procedure
		.input(tKanban)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {id, ...rest} = input;
				await OrmKanban.update(rest, {where: {id}});
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

import {z} from 'zod';

import {TKanbanExtended} from '@appTypes/app.type';
import {tCustomerPO, tKanban} from '@appTypes/app.zod';
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
				return checkCredentialV2(
					req,
					res,
					async (): Promise<TKanbanExtended[]> => {
						const routerCaller = appRouter.createCaller({req, res});
						const allPO = await OrmKanban.findAll({where});
						// @ts-ignore
						const joinedPOPromises = (allPO as TKanban[]).map<
							Promise<TKanbanExtended>
						>(async item => {
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

							return {...item, nomor_po, instruksi_kanban, mesin, po};
						});

						const joinedPO = await Promise.all(joinedPOPromises);

						return joinedPO;
					},
				);
			});
	},

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
		.input(tCustomerPO.pick({nomor_po: true}))
		.mutation(async ({input: {nomor_po}, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				await OrmKanban.destroy({where: {nomor_po}});
				return {message: 'Success'};
			});
		}),
});

export default kanbanRouters;

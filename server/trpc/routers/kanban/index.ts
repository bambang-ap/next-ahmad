import {z} from 'zod';

import {zId} from '@appTypes/app.zod';
import {isProd, Success} from '@constants';
import {ORM, OrmKanban, OrmKanbanItem, OrmScan} from '@database';
import {checkCredentialV2, procedureError} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

import {kanbanGet} from './get';
import {kanbanImage} from './image';
import {kanbanUpsert} from './upsert';

const kanbanRouters = router({
	...kanbanGet,
	...kanbanUpsert,
	...kanbanImage,
	printed: procedure.input(z.string().array()).mutation(({ctx, input}) => {
		if (!isProd) return Success;
		return checkCredentialV2(ctx, async () => {
			const transaction = await ORM.transaction();

			try {
				const kanbans = await OrmKanban.findAll({where: {id: input}});
				const promisedKanbans = kanbans.map(({dataValues: {id, printed = 0}}) =>
					OrmKanban.update({printed: printed + 1}, {transaction, where: {id}}),
				);
				await Promise.all(promisedKanbans);

				await transaction.commit();
				return Success;
			} catch (err) {
				await transaction.rollback();
				procedureError(err);
			}
		});
	}),
	delete: procedure
		.input(zId.partial())
		.mutation(async ({input: {id}, ctx: {req, res}}) => {
			return checkCredentialV2({req, res}, async () => {
				if (!id) {
					throw new TRPCError({code: 'BAD_REQUEST', message: 'ID is required'});
				}

				await OrmScan.destroy({where: {id_kanban: id}});
				await OrmKanbanItem.destroy({where: {id_kanban: id}});
				await OrmKanban.destroy({where: {id}});

				return Success;
			});
		}),
	deleteItem: procedure
		.input(zId.partial())
		.mutation(async ({input: {id}, ctx: {req, res}}) => {
			return checkCredentialV2({req, res}, async () => {
				if (!id) {
					// throw new TRPCError({code: "BAD_REQUEST", message: "ID is required"});
					return {message: 'Failed'};
				}

				await OrmKanbanItem.destroy({where: {id}});

				return Success;
			});
		}),
});

export default kanbanRouters;

import {z} from 'zod';

import {tCustomer, tCustomerPO, uModalType} from '@appTypes/app.zod';
import {Z_CRUD_ENABLED} from '@enum';
import {generateId, MAPPING_CRUD_ORM} from '@server';
import {procedure, router} from '@trpc';

import {
	customer_po_delete,
	customer_po_get,
	customer_po_insert,
	customer_po_update,
} from './customer_po';

export const appRouter = router({
	basic_query: procedure
		.input(z.object({target: Z_CRUD_ENABLED}))
		.query(async ({input}) => {
			const orm = MAPPING_CRUD_ORM[input.target];
			const ormResult = await orm.findAll({order: [['id', 'asc']], raw: true});
			return ormResult;
		}),
	basic_mutate: procedure
		.input(
			z.object({
				target: Z_CRUD_ENABLED,
				type: uModalType,
				body: tCustomer.or(tCustomerPO),
			}),
		)
		.mutation(async ({input}) => {
			const {body, target, type} = input;
			const {id, ...rest} = body;

			const orm = MAPPING_CRUD_ORM[target];

			switch (type) {
				case 'delete':
					return orm.destroy({where: {id}});
				case 'edit':
					return orm.update(body, {where: {id}});
				default:
					return orm.create({...rest, id: generateId()});
			}
		}),
	customer_po_get,
	customer_po_insert,
	customer_po_update,
	customer_po_delete,
});

// export type definition of API
export type AppRouter = typeof appRouter;

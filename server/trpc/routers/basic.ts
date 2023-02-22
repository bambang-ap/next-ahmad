import {z} from 'zod';

import {uModalType} from '@appTypes/app.zod';
import {Z_CRUD_ENABLED} from '@enum';
import {generateId, MAPPING_CRUD_ORM} from '@server';
import {procedure, router} from '@trpc';

const basicRouters = router({
	get: procedure
		.input(
			z.object({
				target: Z_CRUD_ENABLED,
				where: z.record(z.union([z.string(), z.number()])).nullish(),
			}),
		)
		.query(async ({input: {target, where}}) => {
			const orm = MAPPING_CRUD_ORM[target];
			const ormResult = await orm.findAll({where, order: [['id', 'asc']]});
			return ormResult;
		}),

	mutate: procedure
		.input(
			z.object({
				target: Z_CRUD_ENABLED,
				type: uModalType,
				body: z.any(),
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
});

export default basicRouters;

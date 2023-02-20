import {z} from 'zod';

import {uModalType} from '@appTypes/app.zod';
import {Z_CRUD_ENABLED} from '@enum';
import {generateId, MAPPING_CRUD_ORM} from '@server';
import {procedure} from '@trpc';

const basicRouters = {
	basic_query: procedure
		.input(z.object({target: Z_CRUD_ENABLED}))
		.query(async ({input}) => {
			const orm = MAPPING_CRUD_ORM[input.target];
			const ormResult = await orm.findAll({order: [['id', 'asc']]});
			return ormResult;
		}),
	basic_mutate: procedure
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
};

export default basicRouters;

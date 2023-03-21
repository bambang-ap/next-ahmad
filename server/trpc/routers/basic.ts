import {z} from 'zod';

import {uModalType} from '@appTypes/app.zod';
import {eOpKeys, Op, Z_CRUD_ENABLED} from '@enum';
import {generateId, MAPPING_CRUD_ORM} from '@server';
import {procedure, router} from '@trpc';

const basicUnion = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.array(z.any()),
]);

type BasicWherer = z.infer<typeof basicWherer>;
const basicWherer = z.record(
	basicUnion.or(z.record(eOpKeys, basicUnion)).optional(),
);

export const basicWhere = basicWherer.transform(obj => {
	return Object.entries(obj).reduce<BasicWherer>((ret, [key, val]) => {
		if (typeof val === 'object') {
			return {
				...ret,
				[key]: Object.entries(val).reduce((r, [k, v]) => {
					// @ts-ignore
					return {...r, [Op[k]]: v};
				}, {}),
			};
		}

		return {...ret, [key]: val};
	}, {});
});

const basicRouters = router({
	get: procedure
		.input(
			z.object({
				target: Z_CRUD_ENABLED,
				where: basicWhere.optional(),
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
					return orm.update(rest, {where: {id}});
				default:
					return orm.create({...rest, id: generateId()});
			}
		}),
});

export default basicRouters;

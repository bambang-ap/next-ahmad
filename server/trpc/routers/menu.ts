import {Op} from 'sequelize';
import {z} from 'zod';

import {tMenu} from '@appTypes/app.zod';
import {OrmMenu} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

const menuRouters = router({
	get: procedure
		.input(z.object({type: z.literal('menu'), sorted: z.boolean().optional()}))
		.query(async ({ctx: {req, res}, input: {sorted}}) => {
			return checkCredentialV2({req, res}, async session => {
				const allMenu = (
					await OrmMenu.findAll({
						where: {accepted_role: {[Op.substring]: session?.user?.role}},
						order: [['title', 'asc']],
					})
				).map(e => e.dataValues);

				if (sorted) return allMenu.nest('subMenu', 'id', 'parent_id');

				return allMenu;
			});
		}),

	mutate: procedure
		.input(tMenu.array())
		.mutation(({ctx: {req, res}, input}) => {
			return checkCredentialV2({req, res}, async () => {
				const promises = input.map(async ({id, ...row}) => {
					return OrmMenu.update(row, {where: {id}});
				});

				const updatedMenu = await Promise.all(promises);

				return updatedMenu;
			});
		}),
});
export default menuRouters;

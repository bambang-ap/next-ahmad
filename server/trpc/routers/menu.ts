import {Op} from 'sequelize';
import {z} from 'zod';

import {tMenu} from '@appTypes/app.zod';
import {menuAttributes, orderPages, OrmMenu, wherePagesV4} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

const menuRouters = router({
	all: procedure.query(({ctx}) => {
		const {Ret, menu} = menuAttributes();

		type RetType = typeof Ret;

		return checkCredentialV2(ctx, async session => {
			const allMenu = await menu.model.findAll({
				attributes: menu.attributes,
				order: orderPages<RetType>({index: true}),
				where: wherePagesV4<RetType>({
					accepted_role: {[Op.substring]: session?.user?.role},
				}),
			});

			return allMenu.map(e => e.toJSON() as unknown as RetType);
		});
	}),

	allWithSub: procedure.query(({ctx}) => {
		const {RetSub, menu} = menuAttributes();

		type RetType = typeof RetSub;

		return checkCredentialV2(ctx, async session => {
			const rows = await menu.model.findAll({
				logging: true,
				attributes: menu.attributes,
				include: [{...menu, include: [menu]}],
				order: orderPages<RetType>({
					index: true,
					'OrmMenus.index': true,
					'OrmMenus.OrmMenus.index': true,
				}),
				where: wherePagesV4<RetType>(
					{
						parent_id: {[Op.is]: null},
					},
					[
						'or',
						{
							accepted_role: {[Op.substring]: session?.user?.role},
							'$OrmMenus.accepted_role$': {
								[Op.substring]: session?.user?.role,
							},
							'$OrmMenus.OrmMenus.accepted_role$': {
								[Op.substring]: session?.user?.role,
							},
						},
					],
				),
			});

			return rows.map(e => e.toJSON() as unknown as RetType);
		});
	}),

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

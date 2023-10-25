import {Op} from 'sequelize';
import {z} from 'zod';

import {
	tableFormValue,
	TSupplier,
	TSupplierItem,
	tSupplierUpsert,
	zId,
} from '@appTypes/app.zod';
import {Success, through} from '@constants';
import {
	OrmSupItemRelation,
	OrmSupplier,
	OrmSupplierItem,
	wherePages,
} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure} from '@trpc';

const supplierRouters = {
	get: procedure
		.input(tableFormValue.extend({withItem: z.boolean().optional()}))
		.query(({ctx, input}) => {
			type UUU = TSupplier & {OrmSupplierItems: TSupplierItem[]};
			return checkCredentialV2(ctx, async () => {
				const {limit, page, search, withItem = true} = input;
				const {count, rows} = await OrmSupplier.findAndCountAll({
					limit,
					order: [['name', 'desc']],
					offset: (page - 1) * limit,
					where: wherePages('name', search),
					include: withItem ? [{model: OrmSupplierItem, through}] : [],
				});

				return pagingResult(
					count,
					page,
					limit,
					rows.map(e => e.dataValues as UUU),
				);
			});
		}),
	upsert: procedure
		.input(tSupplierUpsert.partial({id: true}))
		.mutation(({ctx, input}) => {
			const {item: items, ...restSupplier} = input;
			return checkCredentialV2(ctx, async () => {
				const [supplier] = await OrmSupplier.upsert({
					...restSupplier,
					id: restSupplier.id || generateId('SP_'),
				});

				const relationToRemove = await OrmSupItemRelation.findAll({
					where: {
						supplier_id: supplier.dataValues.id,
						item_id: {[Op.not]: items},
					},
				});

				items.forEach(async item_id => {
					const relation = await OrmSupItemRelation.findOne({
						where: {supplier_id: supplier.dataValues.id, item_id},
					});

					await OrmSupItemRelation.upsert({
						id: relation?.dataValues.id ?? generateId('SP_IR_'),
						supplier_id: supplier.dataValues.id,
						item_id,
					});
				});

				await Promise.all(
					relationToRemove.map(e =>
						OrmSupItemRelation.destroy({where: {id: e.dataValues.id}}),
					),
				);

				return Success;
			});
		}),
	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await OrmSupItemRelation.destroy({where: {supplier_id: input.id}});
			await OrmSupplier.destroy({where: input});
			return Success;
		});
	}),
};

export default supplierRouters;

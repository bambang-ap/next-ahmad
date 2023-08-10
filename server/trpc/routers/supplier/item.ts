import {Op} from "sequelize";
import {z} from "zod";

import {
	tableFormValue,
	TSupplier,
	TSupplierItem,
	tSupplierItemUpsert,
	zId,
} from "@appTypes/app.zod";
import {Success, through} from "@constants";
import {
	OrmSupItemRelation,
	OrmSupplier,
	OrmSupplierItem,
	wherePages,
} from "@database";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";

const supplierItemRouters = router({
	get: procedure
		.input(tableFormValue.extend({withSupplier: z.boolean().optional()}))
		.query(({ctx, input}) => {
			type UUU = TSupplierItem & {OrmSuppliers: TSupplier[]};
			return checkCredentialV2(ctx, async () => {
				const {limit, page, search, withSupplier = true} = input;
				const {count, rows} = await OrmSupplierItem.findAndCountAll({
					limit,
					order: [["name_item", "desc"]],
					offset: (page - 1) * limit,
					where: wherePages("name_item", search),
					include: withSupplier ? [{model: OrmSupplier, through}] : [],
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
		.input(tSupplierItemUpsert.partial({id: true}))
		.mutation(({ctx, input}) => {
			const {supplier, ...items} = input;
			return checkCredentialV2(ctx, async () => {
				const [item] = await OrmSupplierItem.upsert({
					...items,
					id: items.id || generateId("SP_I"),
				});

				const relationToRemove = await OrmSupItemRelation.findAll({
					where: {
						item_id: item.dataValues.id,
						supplier_id: {[Op.not]: supplier},
					},
				});

				supplier.forEach(async supplier_id => {
					const relation = await OrmSupItemRelation.findOne({
						where: {item_id: item.dataValues.id, supplier_id},
					});

					await OrmSupItemRelation.upsert({
						id: relation?.dataValues.id ?? generateId("SP_IR"),
						item_id: item.dataValues.id,
						supplier_id,
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
			await OrmSupItemRelation.destroy({where: {item_id: input.id}});
			await OrmSupplierItem.destroy({where: input});
			return Success;
		});
	}),
});

export default supplierItemRouters;

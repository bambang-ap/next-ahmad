import {Op} from "sequelize";

import {
	tableFormValue,
	TSupplier,
	TSupplierItem,
	tSupplierItemUpsert,
	zId,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {
	OrmSupItemRelation,
	OrmSupplier,
	OrmSupplierItem,
	wherePages,
} from "@database";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";

const supplierItemRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		type UUU = TSupplierItem & {[OrmSupplier._alias]: TSupplier[]};
		return checkCredentialV2(ctx, async () => {
			const {limit, page, search} = input;
			const {count, rows} = await OrmSupplierItem.findAndCountAll({
				limit,
				order: [["name_item", "desc"]],
				offset: (page - 1) * limit,
				where: wherePages("name_item", search),
				include: [
					{
						model: OrmSupplier,
						as: OrmSupplier._alias,
						through: {attributes: []},
					},
				],
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
					id: items.id || generateId("SPI"),
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
						id: relation?.dataValues.id ?? generateId("SPIR"),
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
	delete: procedure.input(zId.partial()).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await OrmSupItemRelation.destroy({where: {item_id: input.id}});
			await OrmSupplierItem.destroy({where: input});
			return Success;
		});
	}),
});

export default supplierItemRouters;

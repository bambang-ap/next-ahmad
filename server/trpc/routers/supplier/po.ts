import {Model} from "sequelize";
import {z} from "zod";

import {PagingResult} from "@appTypes/app.type";
import {
	tableFormValue,
	TSupItemRelation,
	TSupplier,
	TSupplierItem,
	TSupplierPO,
	TSupplierPOItem,
	TSupplierPOUpsert,
	tSupplierPOUpsert,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {
	OrmSupItemRelation,
	OrmSupplier,
	OrmSupplierItem,
	OrmSupplierPO,
	OrmSupplierPOItem,
} from "@database";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";

type GetPage = TSupplierPOUpsert & {
	supplier?: TSupplier;
};
type OOO = TSupplierPO & {
	id_supplier?: string;
	OrmSupplierPOItems: Model<
		TSupplierPOItem & {
			OrmSupItemRelation: TSupItemRelation & {
				OrmSupplier?: TSupplier;
				OrmSupplierItem?: TSupplierItem;
			};
		}
	>[];
};

const supplierPoRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page} = input;
		return checkCredentialV2(ctx, async (): Promise<PagingResult<GetPage>> => {
			const {count, rows: data} = await OrmSupplierPO.findAndCountAll({
				limit,
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				include: [
					{
						model: OrmSupplierPOItem,
						include: [
							{
								model: OrmSupItemRelation,
								include: [OrmSupplier, OrmSupplierItem],
							},
						],
					},
				],
			});

			const allData = data.map(async e => {
				let supplier: TSupplier;
				const {OrmSupplierPOItems, ...values} = e.dataValues as OOO;
				return {
					...values,
					get id_supplier() {
						return supplier.id;
					},
					get supplier() {
						return supplier;
					},
					items: OrmSupplierPOItems.reduce((ret, {dataValues}) => {
						const {OrmSupItemRelation: SupItem, ...restValues} = dataValues;
						const {OrmSupplier, OrmSupplierItem} = SupItem;
						supplier = OrmSupplier!;
						return {...ret, [OrmSupplierItem?.id!]: restValues};
					}, {} as GetPage["items"]),
				};
			});

			return pagingResult(
				count,
				page,
				limit,
				(await Promise.all(allData)) as GetPage[],
			);
		});
	}),
	upsert: procedure
		.input(tSupplierPOUpsert.partial({id: true}))
		.mutation(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				const {id, id_supplier: supplier_id, items, ...body} = input;

				const [dataPo] = await OrmSupplierPO.upsert(
					{...body, id: id || generateId("SP_PO")},
					{logging: true},
				);

				Object.entries(items).forEach(async ([item_id, {id_po, ...item}]) => {
					const relation = await OrmSupItemRelation.findOne({
						where: {item_id, supplier_id},
					});
					await OrmSupplierPOItem.upsert({
						...item,
						id: item.id ?? generateId("SP_PI"),
						id_po: id_po ?? dataPo.dataValues.id,
						// @ts-ignore
						id_supplier_item: relation?.dataValues.id,
					});
				});

				return Success;
			});
		}),
	delete: procedure.input(z.string()).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await OrmSupplierPO.destroy({where: {id: input}});

			return Success;
		});
	}),
});

export default supplierPoRouters;

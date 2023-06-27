import {z} from "zod";

import {
	PagingResult,
	TSupplier,
	TSupplierItem,
	TSupplierPO,
} from "@appTypes/app.type";
import {tableFormValue, tSupplierPO} from "@appTypes/app.zod";
import {OrmSupplier, OrmSupplierItem, OrmSupplierPO} from "@database";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";

type GetPage = TSupplierPO & {
	OrmSupplier: TSupplier;
	OrmItem: MyObject<TSupplierItem>;
};

const supplierPoRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page} = input;
		return checkCredentialV2(ctx, async (): Promise<PagingResult<GetPage>> => {
			const {count, rows: data} = await OrmSupplierPO.findAndCountAll({
				limit,
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				include: [OrmSupplier],
			});
			const allData = data.map(async e => {
				const values = e.dataValues;
				const idItems = Object.keys(values.items);
				const OrmItem = await OrmSupplierItem.findAll({where: {id: idItems}});
				return {
					...values,
					OrmItem: OrmItem.reduce((ret, {dataValues}) => {
						return {...ret, [dataValues.id]: dataValues};
					}, {} as GetPage["OrmItem"]),
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
		.input(tSupplierPO.partial({id: true}))
		.mutation(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				const {id, ...body} = input;

				await OrmSupplierPO.upsert({...body, id: id || generateId("SP_PO")});

				return {message: "Success"};
			});
		}),
	delete: procedure.input(z.string()).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await OrmSupplierPO.destroy({where: {id: input}});

			return {message: "Success"};
		});
	}),
});

export default supplierPoRouters;

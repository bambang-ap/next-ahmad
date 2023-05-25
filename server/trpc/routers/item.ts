import {z} from "zod";

import {
	tableFormValue,
	TKategoriMesin,
	TMasterItem,
	tMasterItem,
	zId,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {OrmKategoriMesin, OrmMasterItem, wherePages} from "@database";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";
type Y = TMasterItem & {
	OrmKategoriMesin?: TKategoriMesin;
};
const itemRouters = router({
	detail: procedure.input(z.string()).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			const item = await OrmMasterItem.findOne({
				where: {id: input},
				include: [OrmKategoriMesin],
			});

			return item?.toJSON() as Y;
		});
	}),
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;
		return checkCredentialV2(ctx, async () => {
			const {count, rows} = await OrmMasterItem.findAndCountAll({
				limit,
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				where: wherePages([""], search),
				include: [OrmKategoriMesin],
			});

			const data = rows.map(row => {
				const json = row.toJSON() as Y;
				return json;
			});

			return pagingResult(count, page, limit, data);
		});
	}),

	upsert: procedure
		.input(tMasterItem.partial({id: true}))
		.mutation(({ctx, input}) => {
			const {id = generateId(), ...body} = input;
			return checkCredentialV2(ctx, async () => {
				await OrmMasterItem.upsert({id, ...body});

				return Success;
			});
		}),

	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await OrmMasterItem.destroy({where: input});

			return Success;
		});
	}),
});

export default itemRouters;

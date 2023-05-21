import {z} from "zod";

import {
	tableFormValue,
	TKategoriMesin,
	TMasterItem,
	tMasterItem,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {OrmKategoriMesin, OrmMasterItem, wherePages} from "@database";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";
import {TRPCError} from "@trpc/server";

const itemRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;
		return checkCredentialV2(ctx, async () => {
			OrmKategoriMesin.hasMany(OrmMasterItem, {foreignKey: "id"});
			OrmMasterItem.belongsTo(OrmKategoriMesin, {foreignKey: "kategori_mesin"});

			const {count, rows} = await OrmMasterItem.findAndCountAll({
				limit,
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				where: wherePages([""], search),
				include: [OrmKategoriMesin],
			});

			const data = rows.map(row => {
				const json = row.toJSON() as TMasterItem & {
					OrmKategoriMesin: TKategoriMesin;
				};
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

	delete: procedure.input(z.string()).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			const success = await OrmMasterItem.destroy({where: {id: input}});

			if (success > 0) throw new TRPCError({code: "FORBIDDEN"});

			return Success;
		});
	}),
});

export default itemRouters;

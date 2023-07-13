import {z} from "zod";

import {PagingResult} from "@appTypes/app.type";
import {tableFormValue, TMasterItem, tMasterItem, zId} from "@appTypes/app.zod";
import {Success} from "@constants";
import {OrmKategoriMesin, OrmMasterItem, wherePages} from "@database";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";

import {appRouter} from ".";

type GetItem = TMasterItem & {
	nameMesins: string[];
};

type IUI = TMasterItem & {nameMesins: string[]};

const itemRouters = router({
	detail: procedure.input(z.string()).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async (): Promise<IUI> => {
			const item = await OrmMasterItem.findOne({
				where: {id: input},
			});

			const json = item?.toJSON() as GetItem;
			const listMesinKategori = await OrmKategoriMesin.findAll({
				where: {id: json.kategori_mesinn},
			});

			return {
				...json,
				nameMesins: listMesinKategori.map(e => e.dataValues.name),
			};
		});
	}),
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const routerCaller = appRouter.createCaller(ctx);
		const {limit, page, search} = input;
		return checkCredentialV2(ctx, async (): Promise<PagingResult<IUI>> => {
			const {count, rows} = await OrmMasterItem.findAndCountAll({
				limit,
				attributes: ["id"],
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				where: wherePages(
					["name", "kode_item"] as (keyof TMasterItem)[],
					search,
				),
			});

			const data = rows.map(row => {
				const json = row.toJSON() as GetItem;
				return routerCaller.item.detail(json.id);
			});

			return pagingResult(count, page, limit, await Promise.all(data));
		});
	}),

	upsert: procedure
		.input(tMasterItem.partial({id: true}))
		.mutation(({ctx, input}) => {
			const {id = generateId("MI"), ...body} = input;
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

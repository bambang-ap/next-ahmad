import {z} from 'zod';

import {PagingResult} from '@appTypes/app.type';
import {tableFormValue, TMasterItem, tMasterItem, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {ORM, OrmKategoriMesin, OrmMasterItem, wherePages} from '@database';
import {
	checkCredentialV2,
	generateId,
	pagingResult,
	procedureError,
} from '@server';
import {procedure, router} from '@trpc';

import {appRouter} from '.';

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
	get: procedure
		.input(tableFormValue.extend({withDetail: z.boolean().optional()}))
		.query(({ctx, input}) => {
			const routerCaller = appRouter.createCaller(ctx);
			const {limit, page, search, withDetail} = input;
			return checkCredentialV2(ctx, async (): Promise<PagingResult<IUI>> => {
				const {count, rows} = await OrmMasterItem.findAndCountAll({
					limit,
					attributes: ['id', 'name', 'kode_item', 'harga'],
					order: [['id', 'asc']],
					offset: (page - 1) * limit,
					where: wherePages(
						['name', 'kode_item'] as (keyof TMasterItem)[],
						search,
					),
				});

				const data = rows.map(row => {
					const json = row.toJSON() as GetItem;
					if (!withDetail) return json;
					return routerCaller.item.detail(json.id);
				});

				return pagingResult(count, page, limit, await Promise.all(data));
			});
		}),

	upsert: procedure
		.input(tMasterItem.partial({id: true}))
		.mutation(({ctx, input}) => {
			const {id = generateId('MI'), default_mesin = [], ...body} = input;

			return checkCredentialV2(ctx, async () => {
				const transaction = await ORM.transaction();

				try {
					await OrmMasterItem.upsert(
						{id, default_mesin, ...body},
						{transaction},
					);

					await transaction.commit();
					return Success;
				} catch (err) {
					await transaction.rollback();
					procedureError(err);
				}
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

import {Op} from 'sequelize';

import {PagingResult} from '@appTypes/app.type';
import {sItem, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {attrParserV2, oItem, oSup, wherePagesV3} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const itemRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, id: sup_id, search} = input;

		const item = attrParserV2(oItem);
		const sup = attrParserV2(oSup);

		type Ret = typeof item.obj & {
			oSup: typeof sup.obj;
		};

		return checkCredentialV2(ctx, async (): Promise<PagingResult<Ret>> => {
			const searcher = {[Op.iLike]: `%${search}%`};

			const where = !search
				? undefined
				: wherePagesV3<Ret>(
						{nama: searcher, '$oSup.nama$': searcher, kode: searcher},
						'or',
				  );

			const {count, rows} = await item.model.findAndCountAll({
				include: [sup],
				where: !sup_id ? where : {sup_id},
			});

			return pagingResult(
				count,
				page,
				limit,
				rows.map(e => e.toJSON() as unknown as Ret),
			);
		});
	}),
	upsert: procedure
		.input(sItem.partial({id: true}))
		.mutation(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				await oItem.upsert({...input, id: input.id ?? generateId('II-')});

				return Success;
			});
		}),

	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await oItem.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});

import {Op} from 'sequelize';

import {sOutBarang, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {attrParserV2, oItem, oOut, oStock, oSup, wherePagesV3} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const outBarangRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;

		const out = attrParserV2(oOut);
		const stock = attrParserV2(oStock);
		const sup = attrParserV2(oSup);
		const item = attrParserV2(oItem);

		type Ret = typeof out.obj & {
			oStock: typeof stock.obj & {
				oSup?: typeof sup.obj;
				oItem?: typeof item.obj;
			};
		};

		return checkCredentialV2(ctx, async () => {
			const searcher = {[Op.iLike]: `%${search}%`};
			const {count, rows} = await out.model.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
				include: [{...stock, include: [sup, item]}],
				where: !search
					? undefined
					: wherePagesV3<Ret>(
							{
								keterangan: searcher,
								'$oStock.nama$': searcher,
								'$oStock.oSup.nama$': searcher,
								'$oStock.oItem.nama$': searcher,
							},
							'or',
					  ),
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
		.input(sOutBarang.partial({id: true}))
		.mutation(({ctx, input}) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {id: idForm, createdAt: _, ...po} = input;
			return checkCredentialV2(ctx, async () => {
				await oOut.upsert({
					...po,
					id: idForm ?? generateId('IOB-'),
				});

				return Success;
			});
		}),
	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await oOut.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});

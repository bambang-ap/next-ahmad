import {PagingResult} from '@appTypes/app.type';
import {sStock, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {attrParserV2, oItem, oStock, oSup} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const stockRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, id: sup_id} = input;

		const stock = attrParserV2(oStock);
		const item = attrParserV2(oItem);
		const sup = attrParserV2(oSup);

		type Ret = typeof stock.obj & {
			oItem: typeof item.obj;
			oSup: typeof sup.obj;
		};

		return checkCredentialV2(ctx, async (): Promise<PagingResult<Ret>> => {
			const {count, rows} = await stock.model.findAndCountAll({
				include: [sup, item],
				where: !sup_id ? {} : {sup_id},
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
		.input(sStock.partial({id: true}))
		.mutation(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				await oStock.upsert({...input, id: input.id ?? generateId('IST-')});

				return Success;
			});
		}),
	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await oStock.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});

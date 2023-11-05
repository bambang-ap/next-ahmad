import {PagingResult} from '@appTypes/app.type';
import {sStock, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {internalStockAttributes, orderPages, oStock} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export type RetStock = ReturnType<typeof internalStockAttributes>['Ret'];

export const stockRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, id: sup_id} = input;

		const {item, out, stock, sup} = internalStockAttributes();

		return checkCredentialV2(ctx, async (): Promise<PagingResult<RetStock>> => {
			const {count, rows} = await stock.model.findAndCountAll({
				include: [out, sup, item],
				where: !sup_id ? {} : {sup_id},
				order: orderPages<RetStock>({'oOuts.createdAt': false}),
			});

			const data = rows.map(e => {
				const val = e.toJSON() as unknown as RetStock;

				const usedQty = val.oOuts.reduce((total, {qty}) => total + qty, 0);

				return {...val, usedQty, isClosed: val.qty - usedQty <= 0};
			});

			return pagingResult(count, page, limit, data);
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

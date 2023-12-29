import {Op} from 'sequelize';

import {PagingResult} from '@appTypes/app.type';
import {sStock, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {
	internalStockAttributes,
	orderPages,
	ORM,
	oStock,
	wherePagesV3,
} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';
import {isAdminRole} from '@utils';

export type RetStock = ReturnType<typeof internalStockAttributes>['Ret'];

export const stockRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, id: sup_id, ids, search} = input;

		const {item, out, stock, sup} = internalStockAttributes();

		return checkCredentialV2(ctx, async (): Promise<PagingResult<RetStock>> => {
			const searcher = {[Op.iLike]: `%${search}%`};

			const where = !search
				? undefined
				: wherePagesV3<RetStock>(
						{
							nama: searcher,
							kode: searcher,
							'$oSup.nama$': searcher,
							'$oItem.nama$': searcher,
							'$oItem.kode$': searcher,
						},
						'or',
				  );

			const {count, rows} = await stock.model.findAndCountAll({
				include: [out, sup, item],
				where: ids ? {id: ids} : !sup_id ? where : {sup_id},
				order: orderPages<RetStock>({
					updatedAt: false,
					'oOuts.createdAt': false,
				}),
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
		return checkCredentialV2(ctx, async session => {
			if (!isAdminRole(session.user?.role))
				throw new TRPCError({code: 'FORBIDDEN'});

			const transaction = await ORM.transaction();

			try {
				await oStock.destroy({transaction, where: {id: input.id}});

				await transaction.commit();
				return Success;
			} catch (err) {
				await transaction.rollback();
				throw new TRPCError({code: 'BAD_REQUEST'});
			}
		});
	}),
});

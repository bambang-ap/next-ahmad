import {Op} from 'sequelize';

import {tDateFilter, TPOItem} from '@appTypes/app.zod';
import {dPoItem, selectorDashboardSales, whereDateFilter} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

export default function dashboardSalesRouters() {
	const qtyCol = 'qty3' as const;
	const unitCol = 'unit3' as const;

	return router({
		nilai: procedure.input(tDateFilter.partial()).query(({ctx, input}) => {
			const options = selectorDashboardSales<TPOItem>({
				disc: 'discount',
				harga: 'harga',
				qty: 'qty3',
				type: 'discount_type',
				unit: 'unit3',
			});

			return checkCredentialV2(ctx, async () => {
				const ehh = whereDateFilter('$dPoItem.createdAt$', input);
				const data = await dPoItem.unscoped().findAll({
					...options,
					where: {
						[unitCol]: {[Op.not]: null},
						[qtyCol]: {[Op.not]: 'NaN'},
						...ehh,
					},
				});

				return data;
			});
		}),
	});
}

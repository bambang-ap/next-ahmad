import {Op} from 'sequelize';

import {TDashboard, TDashboardTitle, TItemUnit} from '@appTypes/app.type';
import {tDateFilter} from '@appTypes/app.zod';
import {unitData} from '@constants';
import {OrmCustomerPOItem} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {qtyMap} from '@utils';

import {appRouter} from '..';

import {defaultDashboardRouter} from './default';
import machineDashboardRouters from './machine';
import mainDashboardRouter from './main';
import dashboardSalesRouters from './sales';

const dashboardRouters = router({
	...defaultDashboardRouter,
	sales: dashboardSalesRouters(),
	main: mainDashboardRouter(),
	machine: machineDashboardRouters,
	unitCountPoItem: procedure.query(({ctx}) => {
		return checkCredentialV2(ctx, async () => {
			const items = unitData.map(async unit => {
				const item = await OrmCustomerPOItem.findAll({
					where: {[Op.or]: qtyMap(({unitKey}) => ({[unitKey]: unit}))},
				});

				const count = item
					.map(({dataValues}) => {
						return qtyMap(({unitKey, qtyKey}) => {
							const qty = dataValues[qtyKey];
							if (!qty || dataValues[unitKey] !== unit) return null;
							return [unitKey, dataValues[unitKey], qty] as [
								typeof unitKey,
								TItemUnit,
								number,
							];
						})
							.filter(Boolean)
							.reduce((ret, [, , c]) => {
								const qty = parseFloat(c?.toString() ?? '0');
								return ret + qty;
							}, 0);
					})
					.reduce((ret, qty) => ret + qty, 0);

				return {unit, count};
			});

			return Promise.all(items);
		});
	}),

	businessProcess: procedure
		.input(tDateFilter.partial())
		.query(async ({input, ctx}): Promise<TDashboard[]> => {
			const parameters: TDashboardTitle[] = [
				'PO',
				'SPPB In',
				'Kanban',
				'Scan Produksi',
				'Scan QC',
				'Scan Finish Good',
				'SPPB Out',
			];
			const routerCaller = appRouter.createCaller(ctx);
			const datas = await routerCaller.dashboard.totalCount(input);

			return parameters.map(param => {
				return datas.find(d => d.title === param)!;
			});
		}),
});

export default dashboardRouters;

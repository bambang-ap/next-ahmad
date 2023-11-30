import {Op} from 'sequelize';

import {tDateFilter} from '@appTypes/app.zod';
import {
	dashboardMesinAttributes,
	whereDateFilter,
	wherePagesV3,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {qtyMap} from '@utils';

const machineDashboardRouters = router({
	list: procedure.input(tDateFilter.partial()).query(({input, ctx}) => {
		const {
			Ret: ARet,
			Rett: ARett,
			rootRet,
			katMesin,
			knbItem,
			inItem,
			mesin,
			scan,
			poItem,
			scnItem,
		} = dashboardMesinAttributes();

		type Ret = typeof ARet;
		type Rett = typeof ARett;

		return checkCredentialV2(ctx, async () => {
			const {filterFrom, filterTo} = input;

			const dateFilter =
				!!filterFrom && !!filterTo
					? whereDateFilter<Ret>(`$${rootRet}.createdAt$`, input)
					: {};

			const scnItemData = await scnItem.model.findAll({
				logging: true,
				attributes: scnItem.attributes,
				where: {
					...dateFilter,
					...wherePagesV3<Ret>({
						'$dScan.status$': 'produksi',
						'$dKnbItem.id_mesin$': {[Op.not]: null},
					}),
				},
				include: [
					{
						...knbItem,
						include: [
							{...inItem, include: [poItem]},
							{...mesin, include: [katMesin]},
						],
					},
					scan,
				],
			});

			return scnItemData.reduce<Rett>((ret, e) => {
				const val = e.toJSON() as unknown as Ret;

				const mesinId = val.dKnbItem.dMesin?.id || 'tempId';
				const {
					item_from_kanban,
					dKnbItem: {
						dInItem: {dPoItem},
					},
					...item
				} = val;

				if (!ret[mesinId]) {
					ret[mesinId] = {
						data: {
							unit: dPoItem,
							produksi: item,
							planning: item_from_kanban,
						},
						mesin: val.dKnbItem.dMesin,
					};
				} else {
					const {data, mesin: mm} = ret[mesinId]!;
					let {planning, produksi, unit} = data;

					qtyMap(({qtyKey}) => {
						const qProd = parseFloat(produksi[qtyKey]?.toString() ?? '0');
						const qPlan = parseFloat(planning[qtyKey]?.toString() ?? '0');

						const qProds = parseFloat(item[qtyKey]?.toString() ?? '0');
						const qPlans = parseFloat(
							item_from_kanban[qtyKey]?.toString() ?? '0',
						);

						produksi[qtyKey] = qProd + qProds;
						planning[qtyKey] = qPlan + qPlans;
					});

					ret[mesinId] = {mesin: mm, data: {unit, produksi, planning}};
				}

				return ret;
			}, {});
		});
	}),
});

export default machineDashboardRouters;

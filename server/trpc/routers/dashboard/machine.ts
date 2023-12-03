import {Op} from 'sequelize';

import {TDateFilter, tDateFilter, TItemUnit} from '@appTypes/app.zod';
import {
	dashboardMesinAttributes,
	whereDateFilter,
	wherePagesV3,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {qtyMap, V} from '@utils';

async function s(input: Partial<TDateFilter>) {
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

	const {filterFrom, filterTo} = input;

	const dateFilter =
		!!filterFrom && !!filterTo
			? whereDateFilter<Ret>(`$${rootRet}.createdAt$`, input)
			: {};

	const scnItemData = await scnItem.model.findAll({
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

	return scnItemData;
}

const machineDashboardRouters = router({
	summary: procedure.input(tDateFilter.partial()).query(({ctx, input}) => {
		type Ret = typeof ARet;
		type Rett = typeof ARett;

		const {Ret: ARet, Rett: ARett} = dashboardMesinAttributes();

		return checkCredentialV2(ctx, async () => {
			const scnItemData = await s(input);

			type O = Partial<
				Record<
					V['qtyKey'],
					Partial<Record<TItemUnit, [planning: number, produksi: number]>>
				>
			>;

			return scnItemData.reduce<O>((ret, e) => {
				const val = e.toJSON() as unknown as Ret;

				const {
					item_from_kanban,
					dKnbItem: {
						dInItem: {dPoItem},
					},
					...item
				} = val;

				qtyMap(({qtyKey, unitKey}) => {
					if (!ret[qtyKey]) ret[qtyKey] = {};

					const unit = dPoItem[unitKey]!;

					if (!ret[qtyKey]![unit]) ret[qtyKey]![unit] = [0, 0];

					ret[qtyKey]![unit]![0] += parseFloat(
						item_from_kanban[qtyKey]?.toString() ?? '0',
					);
					ret[qtyKey]![unit]![1] += parseFloat(item[qtyKey]?.toString() ?? '0');
				});

				return ret;
			}, {});
		});
	}),

	list: procedure.input(tDateFilter.partial()).query(({input, ctx}) => {
		type Ret = typeof ARet;
		type Rett = typeof ARett;

		const {Ret: ARet, Rett: ARett} = dashboardMesinAttributes();

		return checkCredentialV2(ctx, async () => {
			const scnItemData = await s(input);

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

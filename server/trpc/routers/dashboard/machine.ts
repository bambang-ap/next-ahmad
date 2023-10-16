import {dashboardMesinAttributes, wherePagesV3} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {qtyMap} from '@utils';

const machineDashboardRouters = router({
	list: procedure.query(({ctx}) => {
		const {
			Ret: ARet,
			Rett: ARett,
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
			const scnItemData = await scnItem.model.findAll({
				attributes: scnItem.attributes,
				where: wherePagesV3<Ret>({'$dScan.status$': 'produksi'}),
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
				const mesinId = val.dKnbItem.dMesin.id;
				const {
					dScan: __,
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
					const {data, mesin} = ret[mesinId]!;
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

					ret[mesinId] = {mesin, data: {unit, produksi, planning}};
				}

				return ret;
			}, {});
		});
	}),
});

export default machineDashboardRouters;

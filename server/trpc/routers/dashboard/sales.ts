import {tDateFilter} from '@appTypes/app.zod';
import {
	attrParserV2,
	dInItem,
	dOutItem,
	dPoItem,
	selectorDashboardSales,
	whereDateFilter,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

export default function dashboardSalesRouters() {
	const qtyCol = 'qty3' as const;
	const unitCol = 'unit3' as const;

	return router({
		nilai: procedure.input(tDateFilter.partial()).query(({ctx, input}) => {
			const poItem = attrParserV2(dPoItem.unscoped(), [
				'harga',
				'qty3',
				'unit3',
				'discount',
				'createdAt',
				'discount_type',
			]);
			const inItem = attrParserV2(dInItem.unscoped(), ['qty3', 'createdAt']);
			const outItem = attrParserV2(dOutItem.unscoped(), ['qty3', 'createdAt']);

			type RetPo = typeof poItem.obj;
			type RetIn = typeof inItem.obj & {dPoItem: RetPo};
			type RetOut = typeof outItem.obj & {dInItem: RetIn};

			return checkCredentialV2(ctx, async () => {
				const wherePo = whereDateFilter<RetPo>('$createdAt$', input);
				const optionsPo = selectorDashboardSales<RetPo>(
					{
						qty: qtyCol,
						unit: unitCol,
						harga: 'harga',
						disc: 'discount',
						type: 'discount_type',
					},
					wherePo,
				);

				const whereIn = whereDateFilter<RetIn>('$dInItem.createdAt$', input);
				const optionsIn = selectorDashboardSales<RetIn>(
					{
						qty: `dInItem.${qtyCol}`,
						unit: `dPoItem.${unitCol}`,
						harga: 'dPoItem.harga',
						disc: 'dPoItem.discount',
						type: 'dPoItem.discount_type',
					},
					whereIn,
				);

				const whereOut = whereDateFilter<RetOut>('$dOutItem.createdAt$', input);
				const optionsOut = selectorDashboardSales<RetOut>(
					{
						qty: `dOutItem.${qtyCol}`,
						unit: `dInItem.dPoItem.${unitCol}`,
						harga: 'dInItem.dPoItem.harga',
						disc: 'dInItem.dPoItem.discount',
						type: 'dInItem.dPoItem.discount_type',
					},
					whereOut,
				);

				const dataPo = await poItem.model.unscoped().findAll(optionsPo);
				const dataIn = await inItem.model
					.unscoped()
					.findAll({...optionsIn, include: [{...poItem, attributes: []}]});
				const dataOut = await outItem.model.unscoped().findAll({
					...optionsOut,
					include: [
						{
							...inItem,
							attributes: [],
							include: [{...poItem, attributes: []}],
						},
					],
				});

				return {dataPo, dataIn, dataOut};
			});
		}),
	});
}

import {tCustomerPO, tDateFilter, TDecimal, TItemUnit} from '@appTypes/app.zod';
import {
	attrParserV2,
	dInItem,
	dOutItem,
	dPo,
	dPoItem,
	selectorDashboardSales,
	whereDateFilter,
	wherePagesV2,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

import {z} from 'zod';

import {RouterOutput} from '..';

export type Ret = {
	unit: TItemUnit;
	qty: TDecimal;
	total: TDecimal;
	disc_val: TDecimal;
	total_after: TDecimal;
};

export type RetNilai = RouterOutput['dashboard']['sales']['nilai'];

export default function dashboardSalesRouters() {
	type TFilter = z.infer<typeof tFilter>;

	const qtyCol = 'qty3' as const;
	const unitCol = 'unit3' as const;
	const tFilter = tCustomerPO
		.pick({id_customer: true})
		.extend(tDateFilter.shape);

	async function selectorData(input: Partial<TFilter>) {
		const {id_customer} = input;

		const poItem = attrParserV2(dPoItem.unscoped(), [
			'harga',
			'qty3',
			'unit3',
			'discount',
			'createdAt',
			'discount_type',
		]);
		const po = attrParserV2(dPo.unscoped(), ['id_customer']);
		const inItem = attrParserV2(dInItem.unscoped(), ['qty3', 'createdAt']);
		const outItem = attrParserV2(dOutItem.unscoped(), ['qty3', 'createdAt']);

		type RetPo = typeof poItem.obj & {dPo: typeof po.obj};
		type RetIn = typeof inItem.obj & {dPoItem: RetPo};
		type RetOut = typeof outItem.obj & {dInItem: RetIn};

		const optionsPo = selectorDashboardSales<RetPo>(
			{
				qty: qtyCol,
				unit: unitCol,
				harga: 'dPoItem.harga',
				disc: 'dPoItem.discount',
				type: 'dPoItem.discount_type',
			},
			[
				whereDateFilter<RetPo>('$dPoItem.createdAt$', input),
				wherePagesV2<RetPo>(['$dPo.id_customer$'], id_customer),
			],
		);

		const optionsIn = selectorDashboardSales<RetIn>(
			{
				qty: `dInItem.${qtyCol}`,
				unit: `dPoItem.${unitCol}`,
				harga: 'dPoItem.harga',
				disc: 'dPoItem.discount',
				type: 'dPoItem.discount_type',
			},
			[
				whereDateFilter<RetIn>('$dInItem.createdAt$', input),
				wherePagesV2<RetIn>(['$dPoItem.dPo.id_customer$'], id_customer),
			],
		);

		const optionsOut = selectorDashboardSales<RetOut>(
			{
				qty: `dOutItem.${qtyCol}`,
				unit: `dInItem.dPoItem.${unitCol}`,
				harga: 'dInItem.dPoItem.harga',
				disc: 'dInItem.dPoItem.discount',
				type: 'dInItem.dPoItem.discount_type',
			},
			[
				whereDateFilter<RetOut>('$dOutItem.createdAt$', input),
				wherePagesV2<RetOut>(
					['$dInItem.dPoItem.dPo.id_customer$'],
					id_customer,
				),
			],
		);

		const dataPo = await poItem.model
			.unscoped()
			.findAll({...optionsPo, include: [{...po, attributes: []}]});
		const dataIn = await inItem.model.unscoped().findAll({
			...optionsIn,
			include: [
				{...poItem, attributes: [], include: [{...po, attributes: []}]},
			],
		});
		const dataOut = await outItem.model.unscoped().findAll({
			...optionsOut,
			include: [
				{
					...inItem,
					attributes: [],
					include: [
						{...poItem, attributes: [], include: [{...po, attributes: []}]},
					],
				},
			],
		});

		const [a, b, c] = [
			dataPo as unknown as Ret[],
			dataIn as unknown as Ret[],
			dataOut as unknown as Ret[],
		];

		return {PO: a, SJIn: b, SJOut: c};
	}

	return router({
		nilai: procedure.input(tFilter.partial()).query(({ctx, input}) => {
			return checkCredentialV2(ctx, () => selectorData(input));
		}),
		batchNilai: procedure
			.input(tFilter.partial().array())
			.query(({ctx, input}) => {
				return checkCredentialV2(ctx, () => {
					const results = input.map(t => selectorData(t));

					return Promise.all(results);
				});
			}),
	});
}

import {TItemUnit, UQty} from '@appTypes/app.type';
import {decimalValue} from '@constants';
import {getTotalQty} from '@pageComponent/dashboard/Machine';
import type {RetAsd} from '@trpc/routers/dashboard/machine';

export function useMachine(
	queries: RetAsd[],
	qtyKeySelected: UQty[],
	unitFiltering?: TItemUnit[],
) {
	const series = queries.reduce<ApexAxisChartSeries>((ret, e, i) => {
		const totalQty = getTotalQty(qtyKeySelected, e);

		for (const [name, [, value]] of entries(totalQty)) {
			const isPcsKg = (
				unitFiltering ?? (['pcs', 'kg'] as TItemUnit[])
			).includes(name);
			const index = ret.findIndex(r => r.name === name);

			if (index < 0) {
				if (isPcsKg) {
					ret.push({
						name,
						data: Array.from<number>({length: queries.length}).fill(0),
					});

					ret[ret.findIndex(r => r.name === name)]!.data[i] = parseFloat(
						value.toFixed(decimalValue),
					);
				}
			} else {
				ret[ret.findIndex(r => r.name === name)]!.data[i] = parseFloat(
					value.toFixed(decimalValue),
				);
			}
		}

		return ret;
	}, []);

	return series;
}

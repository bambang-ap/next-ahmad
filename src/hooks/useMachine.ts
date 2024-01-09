import {RouterOutput, UQty} from '@appTypes/app.type';
import {getTotalQty} from '@pageComponent/dashboard/Machine';
import type {RetAsd} from '@trpc/routers/dashboard/machine';
import {qtyMap} from '@utils';

export function useMachine(
	dataProduksi: RetAsd[],
	dataSjOut: RouterOutput['dashboard']['machine']['sjOutList'],
	qtyKeySelected: UQty[],
): ApexAxisChartSeries {
	let rett: Record<string, number[]> = {};
	for (let i = 0; i < dataProduksi.length; i++) {
		const prod = dataProduksi[i];
		const out = dataSjOut[i];
		const totalQty = getTotalQty(qtyKeySelected, prod);

		for (const [nm, [, value]] of entries(totalQty)) {
			// @ts-ignore
			if (nm != 'null') {
				const name = `Prod ${nm}`;

				if (!rett[name]) {
					rett[name] = Array.from<number>({length: dataProduksi.length}).fill(
						0,
					);
					rett[name]![i] = value;
				} else {
					rett[name]![i] = value;
				}
			}
		}

		qtyMap(({num}) => {
			for (const {qty, unit} of out?.[num] ?? []) {
				const name = `Out ${unit}`;
				if (!qtyKeySelected.includes(num)) continue;

				if (!rett[name]) {
					rett[name] = Array.from<number>({length: dataProduksi.length}).fill(
						0,
					);
					rett[name]![i] += parseFloat(qty?.toString() ?? 0);
				} else {
					rett[name]![i] += parseFloat(qty?.toString() ?? 0);
				}
			}
		});
	}

	return entries(rett).map(([name, data]) => ({name, data}));
}

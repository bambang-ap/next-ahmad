import moment from 'moment';
import {useWatch} from 'react-hook-form';

import {FormProps, TItemUnit} from '@appTypes/app.type';
import {chartOpts, decimalValue, formatDate} from '@constants';
import {Chart} from '@prevComp/Chart';
import {trpc} from '@utils/trpc';

import {J} from '.';
import {getTotalQty} from './Machine';

export default function MachineChart({control}: FormProps<J>) {
	const title = `Data Mesin Tahun ${moment().format('YYYY')}`;

	const months = Array.from({length: 12}).map((_, i) => {
		const currentMonth = moment().startOf('year').add(i, 'month');

		return {month: currentMonth.format('MMMM'), currentMonth};
	});

	const {qtyKey: qtyKeySelected = []} = useWatch({control});

	const queries = trpc.useQueries(t => {
		return months.map(({currentMonth}) => {
			const filterFrom = currentMonth.format(formatDate);
			const filterTo = currentMonth.endOf('month').format(formatDate);

			return t.dashboard.machine.summary({filterFrom, filterTo});
		});
	});

	const series = queries.reduce<ApexAxisChartSeries>((ret, e, i) => {
		const totalQty = getTotalQty(qtyKeySelected, e.data);

		for (const [name, [, value]] of entries(totalQty)) {
			const isPcsKg = (['pcs', 'kg'] as TItemUnit[]).includes(name);
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

	return (
		<>
			<div className="text-center text-xl font-bold font-bachshrift">
				{title}
			</div>

			<Chart
				type="bar"
				height={500}
				series={series}
				options={chartOpts(months.map(e => e.month)).opt}
			/>
		</>
	);
}

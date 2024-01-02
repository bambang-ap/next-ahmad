import moment from 'moment';
import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts, formatDate} from '@constants';
import {useMachine} from '@hooks';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {trpc} from '@utils/trpc';

import {J} from '.';

export default function MachineChart({control}: FormProps<J>) {
	const {filterYear} = useWatch({control});

	const now = moment(`${filterYear}/01/01`);
	const horizontal = useRecoilValue(atomIsMobile);
	const title = `Data Mesin Tahun ${now.format('YYYY')}`;

	const months = Array.from({length: 12}).map((_, i) => {
		const currentMonth = now.startOf('year').add(i, 'month');

		return {month: currentMonth.format('MMMM'), currentMonth};
	});

	const {
		qtyKey: qtyKeySelected = [],
		machineCatId,
		machineId,
	} = useWatch({control});

	const queries = trpc.useQueries(t => {
		return months.map(({currentMonth}) => {
			const filterFrom = currentMonth.format(formatDate);
			const filterTo = currentMonth.endOf('month').format(formatDate);

			return t.dashboard.machine.summary({
				filterFrom,
				filterTo,
				machineCatId,
				machineId,
			});
		});
	});

	const series = useMachine(queries, qtyKeySelected);

	return (
		<>
			<div className="text-center text-xl font-bold font-bachshrift">
				{title}
			</div>

			<Chart
				type="bar"
				height={500}
				series={series}
				options={
					chartOpts(
						months.map(e => e.month),
						{hideZero: true, horizontal},
					).opt
				}
			/>
		</>
	);
}

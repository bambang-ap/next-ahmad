import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts} from '@constants';
import {useMachine} from '@hooks';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {trpc} from '@utils/trpc';

import {J, JJ} from '.';

export default function MachineDaily({
	days,
	control,
	daysSelectedDate,
}: FormProps<J> & JJ) {
	const horizontal = useRecoilValue(atomIsMobile);
	const {
		qtyKey: qtyKeySelected = [],
		machineCatId,
		machineId,
	} = useWatch({control});

	const queries = trpc.useQueries(t => {
		return days.map(date => {
			return t.dashboard.machine.summary({
				filterFrom: date,
				filterTo: date,
				machineCatId,
				machineId,
			});
		});
	});

	console.log(queries);

	const series = useMachine(queries, qtyKeySelected);

	const title = `Data Mesin Bulan ${daysSelectedDate.format('MMMM YYYY')}`;

	return (
		<>
			<div className="text-center text-xl font-bold font-bachshrift">
				{title}
			</div>

			<Chart
				type="line"
				height={500}
				series={series}
				options={
					chartOpts(
						days.map((_, i) => i + 1),
						{hideZero: true, horizontal},
					).opt
				}
			/>
		</>
	);
}

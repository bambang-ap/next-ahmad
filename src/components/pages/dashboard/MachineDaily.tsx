import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts, formatDate} from '@constants';
import {useMachine} from '@hooks';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {moment} from '@utils';
import {trpc} from '@utils/trpc';

import {J, JJ} from '.';

export default function MachineDaily({
	days,
	control,
	daysSelectedDate,
}: FormProps<J> & JJ) {
	const horizontal = useRecoilValue(atomIsMobile);
	const {qtyKey: qtyKeySelected = []} = useWatch({control});

	const queries = trpc.useQueries(t => {
		return days.map(date => {
			const filterTo = moment(date).add(1, 'd').format(formatDate);
			return t.dashboard.machine.summary({filterFrom: date, filterTo});
		});
	});

	const series = useMachine(queries, qtyKeySelected, ['kg']);

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

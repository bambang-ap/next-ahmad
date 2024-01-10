import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts} from '@constants';
import {useMachine} from '@hooks';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {trpc} from '@utils/trpc';

import {DashboardForm, JJ} from '.';

export default function MachineDaily({
	days,
	control,
	daysSelectedDate,
}: FormProps<DashboardForm> & JJ) {
	const horizontal = useRecoilValue(atomIsMobile);
	const {
		qtyKey: qtyKeySelected = [],
		machineCatId,
		machineId,
		chartType,
	} = useWatch({control});

	const filtering = days.map(date => {
		return {filterFrom: date, filterTo: date, machineCatId, machineId};
	});

	const {data: dataProd = []} =
		trpc.dashboard.machine.summaryList.useQuery(filtering);
	const {data: dataOut = []} =
		trpc.dashboard.machine.sjOutList.useQuery(filtering);

	const series = useMachine(dataProd, dataOut, qtyKeySelected);

	const title = `Data Mesin Bulan ${daysSelectedDate.format('MMMM YYYY')}`;

	return (
		<>
			<div className="text-center text-xl font-bold font-bachshrift">
				{title}
			</div>

			<Chart
				key={chartType}
				type={chartType}
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

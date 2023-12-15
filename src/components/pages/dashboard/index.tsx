import {Moment} from 'moment';
import {Control, useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {TDashboardView, UQty} from '@appTypes/app.type';
import {ButtonGroup, MultipleButtonGroup} from '@components';
import {BtnGroupQty, DashboardSelectView} from '@constants';
import {UseDateFilterProps, useFormFilter} from '@hooks';
import {atomIsMobile} from '@recoil/atoms';
import {classNames} from '@utils';

import BarChart from './BarChart';
import MachineDashboard from './Machine';
import MachineChart from './MachineChart';
import MachineDaily from './MachineDaily';
import MainDashboard from './Main';
import TotalCount from './TotalCount';

export type J = UseDateFilterProps<{view: TDashboardView; qtyKey: UQty[]}>;
export type JJ = {days: string[]; daysSelectedDate: Moment};

export default function Dashboard() {
	const {
		days,
		fromToComponent,
		daysSelectedDate,
		monthYearComponent,
		form: {control, watch},
	} = useFormFilter<J>(true, {
		defaultValues: {qtyKey: [2, 3]},
	});
	const {view} = watch();

	const isMobile = useRecoilValue(atomIsMobile);

	const isMachine = view === 'machine';
	const isMachineChart = view === 'machine_chart';
	const isMachineDaily = view === 'machine_daily';

	return (
		<div className="flex flex-col">
			<div
				className={classNames('flex gap-2 items-center justify-between mb-4', {
					'flex-col': isMobile,
					'h-20': !isMobile,
				})}>
				<div className="flex-1">
					<ButtonGroup
						wrapped={isMobile}
						className="flex-1"
						fieldName="view"
						control={control}
						data={DashboardSelectView}
						defaultValue={DashboardSelectView?.[0]?.value}
					/>
				</div>
				{(isMachine || isMachineChart || isMachineDaily) && (
					<MultipleButtonGroup
						className={classNames({'w-full': isMobile})}
						control={control}
						fieldName="qtyKey"
						data={BtnGroupQty}
					/>
				)}

				<div
					className={classNames('flex gap-2 justify-end', {
						'w-1/3': !isMobile && (isMachine || isMachineDaily),
						'w-full': isMobile,
					})}>
					{isMachine && fromToComponent}
					{isMachineDaily && monthYearComponent}
				</div>
			</div>
			<RenderView
				days={days}
				control={control}
				daysSelectedDate={daysSelectedDate}
			/>
		</div>
	);
}

function RenderView({
	days,
	control,
	daysSelectedDate,
}: JJ & {control: Control<J>}) {
	const {view} = useWatch({control});

	switch (view) {
		case 'main':
			return <MainDashboard />;
		case 'bar':
			return <BarChart />;
		case 'line':
			return <BarChart type="line" />;
		case 'machine':
			return <MachineDashboard control={control} />;
		case 'machine_chart':
			return <MachineChart control={control} />;
		case 'machine_daily':
			return (
				<MachineDaily
					days={days}
					control={control}
					daysSelectedDate={daysSelectedDate}
				/>
			);
		default:
			return <TotalCount />;
	}
}

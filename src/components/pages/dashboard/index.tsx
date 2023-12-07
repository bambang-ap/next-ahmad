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
import MainDashboard from './Main';
import TotalCount from './TotalCount';

export type J = UseDateFilterProps<{view: TDashboardView; qtyKey: UQty[]}>;

export default function Dashboard() {
	const {
		form: {control, watch},
		dateComponent,
	} = useFormFilter<J>(true, {
		defaultValues: {qtyKey: [2, 3], view: 'machine_chart'},
	});
	const {view} = watch();

	const isMobile = useRecoilValue(atomIsMobile);

	const isMachine = view === 'machine';
	const isMachineChart = view === 'machine_chart';

	return (
		<div className="flex flex-col">
			<div
				className={classNames('flex gap-2 items-center justify-between mb-4', {
					'flex-col': isMobile,
					'h-20': !isMobile,
				})}>
				<div className="flex-1">
					<ButtonGroup
						className="flex-1"
						fieldName="view"
						control={control}
						data={DashboardSelectView}
						defaultValue={DashboardSelectView?.[0]?.value}
					/>
				</div>
				{(isMachine || isMachineChart) && (
					<MultipleButtonGroup
						control={control}
						fieldName="qtyKey"
						data={BtnGroupQty}
					/>
				)}
				{isMachine && (
					<div className="flex gap-2 justify-end">{dateComponent}</div>
				)}
			</div>
			<RenderView control={control} />
		</div>
	);
}

function RenderView({control}: {control: Control<J>}) {
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
		default:
			return <TotalCount />;
	}
}

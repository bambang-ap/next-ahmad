import {Control, useWatch} from 'react-hook-form';

import {TDashboardView} from '@appTypes/app.type';
import {ButtonGroup} from '@components';
import {DashboardSelectView} from '@constants';
import {useDateFilter, UseDateFilterProps} from '@hooks';

import BarChart from './BarChart';
import MachineDashboard from './Machine';
import MainDashboard from './Main';
import TotalCount from './TotalCount';

export type J = UseDateFilterProps<{view: TDashboardView}>;

export default function Dashboard() {
	const {
		form: {control, watch},
		dateComponent,
	} = useDateFilter<J>(true);

	const {view} = watch();

	const dateShown = view === 'machine';

	return (
		<>
			<div className="h-20 flex gap-2 items-center mb-4">
				<ButtonGroup
					className="flex-1"
					fieldName="view"
					control={control}
					data={DashboardSelectView}
					defaultValue={DashboardSelectView?.[0]?.value}
				/>
				{dateShown && dateComponent}
			</div>
			<RenderView control={control} />
		</>
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
		default:
			return <TotalCount />;
	}
}

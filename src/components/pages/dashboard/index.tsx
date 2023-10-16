import {Control, useForm, useWatch} from 'react-hook-form';

import {TDashboardView} from '@appTypes/app.type';
import {ButtonGroup} from '@components';
import {DashboardSelectView} from '@constants';

import BarChart from './BarChart';
import MachineDashboard from './Machine';
import MainDashboard from './Main';
import TotalCount from './TotalCount';

type J = {view: TDashboardView};

export default function Dashboard() {
	const {control} = useForm<J>();

	return (
		<>
			<ButtonGroup
				className="mb-4"
				fieldName="view"
				control={control}
				data={DashboardSelectView}
				defaultValue={DashboardSelectView?.[0]?.value}
			/>
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
			return <MachineDashboard />;
		default:
			return <TotalCount />;
	}
}

import {useForm} from 'react-hook-form';

import {FormProps, TItemUnit} from '@appTypes/app.type';

import {DashboardForm} from '..';

import DonutChart from './DonutChart';
import QtyTable from './QtyTable';

export type FormValue = {type: TItemUnit};

export default function MainDashboard(rootForm: FormProps<DashboardForm>) {
	const {control, setValue} = useForm<FormValue>({
		defaultValues: {type: 'pcs'},
	});

	return (
		<>
			<QtyTable rootForm={rootForm} setValue={setValue} control={control} />
			<div className="mt-6 flex justify-center">
				<div className="w-4/12">
					<DonutChart rootForm={rootForm} control={control} />
				</div>
			</div>
		</>
	);
}

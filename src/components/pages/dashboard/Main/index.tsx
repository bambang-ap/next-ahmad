import {useForm} from 'react-hook-form';

import {TItemUnit} from '@appTypes/app.type';

import DonutChart from './DonutChart';
import QtyTable from './QtyTable';

export type FormValue = {type: TItemUnit};

export default function MainDashboard() {
	const {control, setValue} = useForm<FormValue>({
		defaultValues: {type: 'pcs'},
	});

	return (
		<>
			<QtyTable setValue={setValue} control={control} />
			<div className="mt-6 flex justify-center">
				<div className="w-4/12">
					<DonutChart control={control} />
				</div>
			</div>
		</>
	);
}

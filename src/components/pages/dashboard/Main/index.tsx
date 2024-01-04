import {useForm, useWatch} from 'react-hook-form';

import {FormProps, TItemUnit} from '@appTypes/app.type';

import {DashboardForm} from '..';

import {dateUtils} from '@utils';

import DonutChart from './DonutChart';
import QtyTable from './QtyTable';

export type FormValue = {type: TItemUnit};

export default function MainDashboard(rootForm: FormProps<DashboardForm>) {
	const {filterFrom, filterTo} = useWatch(rootForm);
	const {control, setValue} = useForm<FormValue>({
		defaultValues: {type: 'pcs'},
	});

	const fromDate = dateUtils.dateS(filterFrom);
	const toDate = dateUtils.dateS(filterTo);

	const title = `${fromDate} s/d ${toDate}`;

	return (
		<>
			<div className="text-center text-xl font-bold font-bachshrift mb-4">
				{title}
			</div>

			<QtyTable rootForm={rootForm} setValue={setValue} control={control} />
			<div className="mt-6 flex justify-center">
				<div className="w-4/12">
					<DonutChart rootForm={rootForm} control={control} />
				</div>
			</div>
		</>
	);
}

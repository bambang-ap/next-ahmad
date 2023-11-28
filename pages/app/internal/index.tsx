import {FieldValues, useForm} from 'react-hook-form';

import {TDashboardInternal} from '@appTypes/app.zod';
import {ButtonGroup, Input, SelectPropsData} from '@components';
import {getLayout} from '@hoc';
import {InternalDashboard} from '@pageComponent/internal-dashboard';
import {dateUtils, moment} from '@utils';

Internal.getLayout = getLayout;

export type FormType = {view: TDashboardInternal; from: string; to: string};

const data: SelectPropsData<TDashboardInternal>[] = [
	{value: 'qty', label: 'Qty'},
	{value: 'transaksi', label: 'Nilai Transaksi'},
];

type J<F extends FieldValues> = F & {
	filter: {
		from: string;
		to: string;
	};
};

function useDateFilter<F extends FieldValues, K extends J<F>>() {
	const form = useForm<K>();

	const component = (
		<>
			<Input
				type="date"
				fieldName=""
				label="Dari Tanggal"
				control={form.control}
			/>
			<Input
				type="date"
				fieldName="filter.to"
				control={form.control}
				label="Sampai Tanggal"
			/>
		</>
	);

	return {form, component};
}

export default function Internal() {
	const today = moment();
	const to = dateUtils.readable(today.endOf('month').unix() * 1000)!;
	const from = dateUtils.readable(today.startOf('month').unix() * 1000)!;

	const {control, watch} = useForm<FormType>({
		defaultValues: {view: 'qty', from, to},
	});
	const {view} = watch();

	const isCalculated = view === 'transaksi';

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between gap-2">
				<ButtonGroup control={control} fieldName="view" data={data} />
				<div className="flex gap-2">
					<Input
						type="date"
						fieldName="from"
						label="Dari Tanggal"
						control={control}
					/>
					<Input
						type="date"
						fieldName="to"
						control={control}
						label="Sampai Tanggal"
					/>
				</div>
			</div>
			<InternalDashboard control={control} calculated={isCalculated} />
		</div>
	);
}

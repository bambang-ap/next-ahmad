import {TDashboardInternal} from '@appTypes/app.zod';
import {ButtonGroup, SelectPropsData} from '@components';
import {getLayout} from '@hoc';
import {UseDateFilterProps, useFormFilter} from '@hooks';
import {InternalDashboard} from '@pageComponent/internal-dashboard';

Internal.getLayout = getLayout;

export type FormType = UseDateFilterProps<{view: TDashboardInternal}>;

const data: SelectPropsData<TDashboardInternal>[] = [
	{value: 'qty', label: 'Qty'},
	{value: 'transaksi', label: 'Nilai Transaksi'},
];

export default function Internal() {
	const {
		dateComponent,
		form: {control, watch},
	} = useFormFilter<UseDateFilterProps<FormType>>(true, {
		defaultValues: {view: 'qty'},
	});

	const {view} = watch();

	const isCalculated = view === 'transaksi';

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between gap-2">
				<ButtonGroup control={control} fieldName="view" data={data} />
				<div className="flex gap-2">{dateComponent}</div>
			</div>
			<InternalDashboard control={control} calculated={isCalculated} />
		</div>
	);
}

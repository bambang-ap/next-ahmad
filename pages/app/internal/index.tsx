import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {TDashboardInternal} from '@appTypes/app.zod';
import {ButtonGroup, SelectPropsData} from '@components';
import {getLayout} from '@hoc';
import {UseDateFilterProps, useFormFilter} from '@hooks';
import InternalDashboardMTransaksi from '@pageComponent/internal-dashboard/MonthTransaksi';
import {InternalDashboardQty} from '@pageComponent/internal-dashboard/Qty';
import {InternalDashboardTransaksi} from '@pageComponent/internal-dashboard/Transaksi';

Internal.getLayout = getLayout;

export type FormType = UseDateFilterProps<{view: TDashboardInternal}>;

const data: SelectPropsData<TDashboardInternal>[] = [
	{value: 'qty', label: 'Qty'},
	{value: 'transaksi', label: 'Nilai Transaksi'},
	{value: 'm-transaksi', label: 'Monthly Transaksi'},
	{value: 'd-transaksi', label: 'Daily Transaksi'},
];

export default function Internal() {
	const {
		monthYearComponent,
		fromToComponent,
		form: {control, watch},
	} = useFormFilter<UseDateFilterProps<FormType>>(true, {
		defaultValues: {view: 'qty'},
	});

	const {view} = watch();

	const isMonthly = view === 'm-transaksi';
	const isDaily = view === 'd-transaksi';

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between items-center gap-2">
				<ButtonGroup control={control} fieldName="view" data={data} />
				<div className="flex w-1/3 gap-2">
					{!isDaily && !isMonthly && fromToComponent}
					{isDaily && monthYearComponent}
				</div>
			</div>
			<RenderInternalDashboard control={control} />
		</div>
	);
}

function RenderInternalDashboard({control}: FormProps<FormType>) {
	const {view} = useWatch({control});

	switch (view) {
		case 'qty':
			return <InternalDashboardQty control={control} />;
		case 'transaksi':
			return <InternalDashboardTransaksi control={control} />;
		case 'm-transaksi':
			return <InternalDashboardMTransaksi control={control} />;
		case 'd-transaksi':
			return <InternalDashboardTransaksi control={control} />;
		default:
			return <InternalDashboardQty control={control} />;
	}
}

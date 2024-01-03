import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {TDashboardInternal} from '@appTypes/app.zod';
import {ButtonGroup, SelectPropsData} from '@components';
import {getLayout} from '@hoc';
import {UseDateFilterProps, useFormFilter} from '@hooks';
import InternalDashboardDTransaksi from '@pageComponent/internal-dashboard/DailyTransaksi';
import InternalDashboardMTransaksi from '@pageComponent/internal-dashboard/MonthTransaksi';
import {InternalDashboardTransaksi} from '@pageComponent/internal-dashboard/Transaksi';

Internal.getLayout = getLayout;

export type FormType = UseDateFilterProps<{view: TDashboardInternal}>;

const data: SelectPropsData<TDashboardInternal>[] = [
	// {value: 'qty', label: 'Qty'},
	{value: 'transaksi', label: 'Nilai Transaksi'},
	{value: 'm-transaksi', label: 'Monthly Transaksi'},
	{value: 'd-transaksi', label: 'Daily Transaksi'},
];

export default function Internal() {
	const {
		MonthYear,
		fromToComponent,
		form: {control, watch},
		days,
	} = useFormFilter<UseDateFilterProps<FormType>>({
		sameMonth: true,
		defaultValues: {view: 'transaksi'},
	});

	const {view} = watch();

	const isTrx = view === 'transaksi';
	const isMonthly = view === 'm-transaksi';
	const isDaily = view === 'd-transaksi';

	const showFromTo = isTrx;
	const showMonthYear = isDaily || isMonthly;
	const hideMonth = isMonthly;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between items-center gap-2">
				<ButtonGroup control={control} fieldName="view" data={data} />
				<div className="flex w-1/3 gap-2">
					{showFromTo && fromToComponent}
					{showMonthYear && <MonthYear hideMonth={hideMonth} />}
				</div>
			</div>
			<RenderInternalDashboard days={days} control={control} />
		</div>
	);
}

function RenderInternalDashboard({
	control,
	days,
}: FormProps<FormType> & {days: string[]}) {
	const {view} = useWatch({control});

	switch (view) {
		// case 'qty':
		// 	return <InternalDashboardQty control={control} />;
		case 'transaksi':
			return <InternalDashboardTransaksi control={control} />;
		case 'm-transaksi':
			return <InternalDashboardMTransaksi control={control} />;
		case 'd-transaksi':
			return <InternalDashboardDTransaksi days={days} control={control} />;
		default:
			return <InternalDashboardTransaksi control={control} />;
		// return <InternalDashboardQty control={control} />;
	}
}

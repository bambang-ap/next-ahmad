import {TDashboardSalesView} from '@appTypes/app.zod';
import {Button, ButtonGroup, Input, SelectPropsData} from '@components';
import {getLayout} from '@hoc';
import {useFormFilter} from '@hooks';
import DashboardMonthly from '@pageComponent/dashboard/Sales/Monthly';
import DashboardNilai, {
	DashboardForm,
} from '@pageComponent/dashboard/Sales/Nilai';

DashboardSales.getLayout = getLayout;

export default function DashboardSales() {
	const {
		days,
		MonthYear,
		fromToComponent,
		form: {control, watch},
	} = useFormFilter<DashboardForm>({
		sameMonth: true,
		defaultValues: {chartType: 'bar', view: 'nilai', withDiscount: false},
	});

	const {view} = watch();

	const isDaily = view === 'daily';
	const isMonthly = view === 'monthly';

	const btnData: SelectPropsData<TDashboardSalesView>[] = [
		{value: 'nilai'},
		{value: 'monthly'},
		{value: 'daily'},
	];

	function RenderView() {
		switch (view) {
			case 'monthly':
			case 'daily':
				return <DashboardMonthly days={days} control={control} />;
			default:
				return <DashboardNilai control={control} />;
		}
	}

	return (
		<div className="gap-2 flex flex-col">
			<div className="flex gap-2 justify-between">
				<ButtonGroup control={control} fieldName="view" data={btnData} />
				<div className="flex w-1/3 gap-2">
					{isDaily || isMonthly ? (
						<MonthYear hideMonth={isDaily} />
					) : (
						fromToComponent
					)}
					<Input
						type="checkbox"
						control={control}
						fieldName="withDiscount"
						renderChildren={v => (
							<Button color={v ? 'primary' : undefined} icon="faTags" />
						)}
					/>
				</div>
			</div>

			<RenderView />
		</div>
	);
}

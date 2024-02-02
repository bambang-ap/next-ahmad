import {SelectCustomer} from '@appComponent/PageTable/SelectCustomer';
import {TDashboardSalesView} from '@appTypes/app.zod';
import {Button, ButtonGroup, Input, SelectPropsData} from '@components';
import {getLayout} from '@hoc';
import {useFormFilter} from '@hooks';
import DashboardMonthly from '@pageComponent/dashboard/Sales/Monthly';
import DashboardNilai, {
	DashboardForm,
} from '@pageComponent/dashboard/Sales/Nilai';
import {trpc} from '@utils/trpc';

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
	const {data, isLoading} = trpc.kanban.po.get_customer.useQuery();

	const isDaily = view === 'daily';
	const isMonthly = view === 'monthly';
	const isChart = isDaily || isMonthly;

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
			<div className="flex gap-2 items-center justify-between">
				<div className="flex-1">
					<ButtonGroup
						className="flex-1"
						control={control}
						fieldName="view"
						data={btnData}
					/>
				</div>

				<SelectCustomer
					className="w-1/4 mr-6"
					control={control}
					isLoading={isLoading}
					data={data}
					fieldName="id_customer"
				/>

				<div className="flex w-2/5 items-center gap-2">
					{isChart ? <MonthYear hideMonth={!isDaily} /> : fromToComponent}
					<Input
						type="checkbox"
						control={control}
						fieldName="withDiscount"
						renderChildren={v => (
							<Button color={v ? 'primary' : undefined} icon="faTags" />
						)}
					/>
					{isChart && (
						<ButtonGroup
							control={control}
							fieldName="chartType"
							data={[{value: 'bar'}, {value: 'line'}]}
						/>
					)}
				</div>
			</div>

			<RenderView />
		</div>
	);
}

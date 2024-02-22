import {MultipleSelect, selectMapper} from '@components';
import {getLayout} from '@hoc';
import {useFormFilter} from '@hooks';
import DashboardGradeKanban, {
	DashboardForm,
} from '@pageComponent/dashboard/Grade/Kanban';
import {trpc} from '@utils/trpc';

DashboardSales.getLayout = getLayout;

export default function DashboardSales() {
	const {
		// MonthYear,
		// fromToComponent,
		form: {control, watch},
	} = useFormFilter<DashboardForm>({
		sameMonth: true,
		defaultValues: {chartType: 'bar', view: 'nilai'},
	});

	const {view} = watch();
	const {data, isLoading} = trpc.kanban.po.get_customer.useQuery();

	// const isDaily = view === 'daily';
	// const isMonthly = view === 'monthly';
	// const isChart = isDaily || isMonthly;

	// const btnData: SelectPropsData<TDashboardSalesView>[] = [];

	function RenderView() {
		switch (view) {
			default:
				return <DashboardGradeKanban control={control} />;
		}
	}

	return (
		<div className="gap-2 flex flex-col">
			<div className="flex gap-2 items-center justify-between">
				{/* <div className="flex-1">
					<ButtonGroup
						className="flex-1"
						control={control}
						fieldName="view"
						data={btnData}
					/>
				</div> */}

				<MultipleSelect
					// className="w-1/4 mr-6"
					className="flex-1"
					control={control}
					isLoading={isLoading}
					data={selectMapper(data ?? [], 'id', 'name')}
					fieldName="id_customer"
				/>

				{/* <div className="flex w-2/5 items-center gap-2">
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
				</div> */}
			</div>

			<RenderView />
		</div>
	);
}

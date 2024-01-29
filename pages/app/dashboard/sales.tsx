import {getLayout} from '@hoc';
import {useFormFilter} from '@hooks';
import DashboardNilai, {DashboardForm} from '@pageComponent/dashboard/Sales';

DashboardSales.getLayout = getLayout;

export default function DashboardSales() {
	const {
		fromToComponent,
		form: {control},
	} = useFormFilter<DashboardForm>({sameMonth: true});

	return (
		<div className="gap-2 flex flex-col">
			<div className="flex gap-2">{fromToComponent}</div>
			<DashboardNilai control={control} />
		</div>
	);
}

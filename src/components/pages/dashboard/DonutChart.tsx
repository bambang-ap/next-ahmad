import {Chart} from "@prevComp/Chart";
import {trpc} from "@utils/trpc";

export default function DonutChart() {
	const {data} = trpc.dashboard.unitCountPoItem.useQuery();

	const {categories = [], dataChart = []} =
		data?.reduce(
			(ret, cur) => {
				ret.categories.push(cur.unit.ucwords());
				ret.dataChart.push(cur.count);
				return ret;
			},
			{categories: [] as string[], dataChart: [] as number[]},
		) ?? {};

	return (
		<Chart
			type="pie"
			height={500}
			series={dataChart}
			options={{labels: categories}}
		/>
	);
}

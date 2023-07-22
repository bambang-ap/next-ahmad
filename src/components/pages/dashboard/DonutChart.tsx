import {Chart} from "@prevComp/Chart";
import {trpc} from "@utils/trpc";

export default function DonutChart() {
	const {data} = trpc.dashboard.totalCount.useQuery();

	const {categories = [], dataChart = []} =
		data?.reduce(
			(ret, cur) => {
				ret.categories.push(cur.title);
				ret.dataChart.push(cur.count);
				return ret;
			},
			{categories: [] as string[], dataChart: [] as number[]},
		) ?? {};

	return (
		<Chart
			height={500}
			type="donut"
			options={{labels: categories}}
			series={dataChart}
		/>
	);
}

import {Chart} from "@prevComp/Chart";
import {trpc} from "@utils/trpc";

export default function BarChart({type = "bar"}: {type?: "bar" | "line"}) {
	const {data} = trpc.dashboard.businessProcess.useQuery();

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
			key={type}
			height={500}
			type={type}
			options={{xaxis: {categories}}}
			series={[{name: "series-1", data: dataChart}]}
		/>
	);
}

import {useRecoilValue} from 'recoil';

import {chartOpts} from '@constants';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {trpc} from '@utils/trpc';

export default function BarChart({type = 'bar'}: {type?: 'bar' | 'line'}) {
	const horizontal = useRecoilValue(atomIsMobile);
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
			options={chartOpts(categories, {horizontal}).opt}
			series={[{name: 'series-1', data: dataChart}]}
		/>
	);
}

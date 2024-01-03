import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts, formatAll} from '@constants';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {moment} from '@utils';
import {trpc} from '@utils/trpc';

import {DashboardForm} from '.';

export default function BarChart({
	type = 'bar',
	control,
}: FormProps<DashboardForm> & {type?: 'bar' | 'line'}) {
	const {filterYear} = useWatch({control});
	const now = moment(`${filterYear}/01/01`);
	const title = `Data Tahun ${now.format('YYYY')}`;

	const horizontal = useRecoilValue(atomIsMobile);
	const {data} = trpc.dashboard.businessProcess.useQuery({
		filterFrom: now.format(formatAll),
		filterTo: now.endOf('year').format(formatAll),
	});

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
		<>
			<div className="text-center text-xl font-bold font-bachshrift">
				{title}
			</div>

			<Chart
				key={type}
				height={500}
				type={type}
				options={chartOpts(categories, {horizontal}).opt}
				series={[{name: 'series-1', data: dataChart}]}
			/>
		</>
	);
}

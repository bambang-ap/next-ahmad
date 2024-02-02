import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts, formatDate} from '@constants';
import {MenuName} from '@enum';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {dateUtils, moment} from '@utils';
import {trpc} from '@utils/trpc';

import {DashboardForm} from './Nilai';

export default function DashboardMonthly({
	control,
	days,
}: FormProps<DashboardForm> & {days: string[]}) {
	const {filterYear, id_customer, chartType, withDiscount, view} = useWatch({
		control,
	});

	const horizontal = useRecoilValue(atomIsMobile);

	const now = moment(`${filterYear}/01/01`);
	const months = dateUtils.getMonths(now);
	const isDaily = view === 'daily';

	const filteringMonth = months.map(({currentMonth}) => {
		const filterFrom = currentMonth.format(formatDate);
		const filterTo = currentMonth.endOf('month').format(formatDate);

		return {filterFrom, filterTo};
	});

	const filteringDay = days.map(date => {
		return {filterFrom: date, filterTo: date};
	});

	const {data = []} = trpc.dashboard.sales.batchNilai.useQuery(
		isDaily ? filteringDay : filteringMonth,
	);

	const categories = isDaily
		? days.map((_, i) => i + 1)
		: months.map(e => e.month);

	const series = data.reduce((ret, dataNilai, i) => {
		const dataEntries = entries(dataNilai);

		for (const [key, val] of dataEntries) {
			const name = MenuName[key];
			const nameDisc = `${name} Diskon`;

			if (!ret.has(name)) {
				ret.set(name, {
					name,
					data: Array.from<number>({length: data.length}).fill(0),
				});
			}

			if (!ret.has(nameDisc) && withDiscount) {
				ret.set(nameDisc, {
					name: nameDisc,
					data: Array.from<number>({length: data.length}).fill(0),
				});
			}

			const v = ret.get(name)!;
			v.data[i] = parseFloat((val?.[0]?.total_after ?? 0).toString());
			ret.set(name, v);

			if (withDiscount) {
				const vDisc = ret.get(nameDisc)!;
				vDisc.data[i] = parseFloat((val?.[0]?.total_after ?? 0).toString());
				ret.set(nameDisc, vDisc);
			}
		}

		return ret;
	}, new Map<string, ApexAxisChartSeries[number]>());

	return (
		<>
			<Chart
				key={chartType}
				type={chartType}
				height={500}
				width="100%"
				series={[...series.values()]}
				options={chartOpts(categories, {hideZero: true, horizontal}).opt}
			/>
		</>
	);
}

import moment from 'moment';
import {FormType} from 'pages/app/internal';
import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts} from '@constants';
import {useDashboardTransaksi} from '@hooks';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {trpc} from '@utils/trpc';

export default function InternalDashboardDTransaksi({
	days,
	control,
}: FormProps<FormType> & {days: string[]}) {
	const {filterMonth, filterYear} = useWatch({control});

	const horizontal = useRecoilValue(atomIsMobile);
	const title = `Data Transaksi Bulan ${moment(
		`${filterYear}/${filterMonth! + 1}`,
	).format('MMMM YYYY')}`;

	const queries = trpc.useQueries(t => {
		return days.map(date => {
			return t.internal.dashboard.total({
				filterFrom: date,
				filterTo: date,
				isCalculated: true,
			});
		});
	});

	const series = useDashboardTransaksi(queries);
	const {opt: options} = chartOpts(
		days.map((_, i) => i + 1),
		{hideZero: true, horizontal},
	);

	return (
		<>
			<div className="text-center text-xl font-bold font-bachshrift">
				{title}
			</div>

			<Chart
				type="bar"
				height={500}
				series={series}
				options={{...options, chart: {...options.chart, stacked: true}}}
			/>
		</>
	);
}

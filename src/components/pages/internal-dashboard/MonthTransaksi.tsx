import moment from 'moment';
import {FormType} from 'pages/app/internal';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts, formatDate} from '@constants';
import {useDashboardTransaksi} from '@hooks';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {dateUtils} from '@utils';
import {trpc} from '@utils/trpc';

export default function InternalDashboardMTransaksi({}: FormProps<FormType>) {
	const now = moment();
	const horizontal = useRecoilValue(atomIsMobile);
	const title = `Data Transaksi Tahun ${now.format('YYYY')}`;
	const months = dateUtils.getMonths(now);

	const queries = trpc.useQueries(t => {
		return months.map(({currentMonth}) => {
			const filterFrom = currentMonth.format(formatDate);
			const filterTo = currentMonth.endOf('month').format(formatDate);

			return t.internal.dashboard.total({
				filterFrom,
				filterTo,
				isCalculated: true,
			});
		});
	});

	const series = useDashboardTransaksi(queries);
	const {opt: options} = chartOpts(
		months.map(e => e.month),
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

import moment from 'moment';
import {FormType} from 'pages/app/internal';
import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts, formatDate} from '@constants';
import {useDashboardTransaksi} from '@hooks';
import {Chart} from '@prevComp/Chart';
import {atomIsMobile} from '@recoil/atoms';
import {dateUtils} from '@utils';
import {trpc} from '@utils/trpc';

export default function InternalDashboardMTransaksi({
	control,
}: FormProps<FormType>) {
	const {filterYear} = useWatch({control});
	const now = moment(`${filterYear}-01-01`);
	const horizontal = useRecoilValue(atomIsMobile);
	const title = `Data Transaksi Tahun ${now.format('YYYY')}`;
	const months = dateUtils.getMonths(now);

	const {data = []} = trpc.internal.dashboard.totalList.useQuery(
		months.map(({currentMonth}) => {
			const filterFrom = currentMonth.format(formatDate);
			const filterTo = currentMonth.endOf('month').format(formatDate);
			return {filterFrom, filterTo, isCalculated: true};
		}),
	);

	const series = useDashboardTransaksi(data);

	return (
		<>
			<div className="text-center text-xl font-bold font-bachshrift">
				{title}
			</div>

			<Chart
				type="bar"
				height={500}
				series={series}
				options={
					chartOpts(
						months.map(e => e.month),
						{horizontal, hideZero: true, currency: true},
					).opt
				}
			/>
		</>
	);
}
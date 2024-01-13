import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {chartOpts, decimalValue} from '@constants';
import {useQtyData} from '@hooks';
import {Chart} from '@prevComp/Chart';

import {DashboardForm} from '..';

import {atomIsMobile} from '@recoil/atoms';
import {getTwColor} from '@utils';

import {FormValue} from './';

export default function DonutChart({
	control,
	rootForm,
}: FormProps<FormValue> & {rootForm: FormProps<DashboardForm>}) {
	const horizontal = useRecoilValue(atomIsMobile);
	const {type} = useWatch({control});
	const {qtyParser} = useQtyData(rootForm);

	const qtys = qtyParser(type!);
	const chartOpt = chartOpts(
		qtys.map(([n]) => n),
		{horizontal},
	);

	const series: ApexAxisChartSeries = [
		{
			data: qtys.map(([x, qty, color]) => {
				const y = parseFloat(qty.toFixed(decimalValue));
				const fillColor = getTwColor(color);
				return {x, y, fillColor};
			}),
		},
	];

	return (
		<>
			<div className="text-center mb-4">Grafik Qty {type?.ucwords()}</div>
			<Chart
				key={type}
				type="bar"
				height={500}
				series={series}
				options={chartOpt.opt}
			/>
		</>
	);
}

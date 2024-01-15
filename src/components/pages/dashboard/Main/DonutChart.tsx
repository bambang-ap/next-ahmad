import {useEffect} from 'react';

import {useForm, useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {MultipleButtonGroup} from '@baseComps/Input/ButtonGroup';
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

	const {control: ctrl, watch, reset} = useForm<{ss: string[]}>();
	const {qtyParser} = useQtyData(rootForm);
	const {ss} = watch();
	const {type} = useWatch({control});

	const qtysa = qtyParser(type!);
	const categories = qtysa.map(([n]) => n);
	const qtys = qtysa.filter(([n]) => ss?.includes(n));
	const chartOpt = chartOpts(categories, {horizontal});

	const series: ApexAxisChartSeries = [
		{
			data: qtys.map(([x, qty, color]) => {
				const y = parseFloat(qty.toFixed(decimalValue));
				const fillColor = getTwColor(color);
				return {x, y, fillColor};
			}),
		},
	];

	useEffect(() => {
		if (!!categories && !ss) reset({ss: categories});
	}, [categories]);

	return (
		<div className="flex flex-col gap-2">
			<Chart
				key={type}
				type="bar"
				height={500}
				series={series}
				options={chartOpt.opt}
			/>
			<MultipleButtonGroup
				control={ctrl}
				fieldName="ss"
				data={qtysa.map(([value]) => ({value}))}
			/>
		</div>
	);
}

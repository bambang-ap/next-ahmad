import {useWatch} from 'react-hook-form';
import twColors from 'tailwindcss/colors';

import {FormProps} from '@appTypes/app.type';
import {useQtyData} from '@hooks';
import {Chart} from '@prevComp/Chart';

import {FormValue} from './';

export default function DonutChart({control}: FormProps<FormValue>) {
	const {type} = useWatch({control});
	const {qtyParser} = useQtyData();

	const qtys = qtyParser(type!);

	return (
		<>
			<div className="text-center mb-4">Grafik Qty {type?.ucwords()}</div>
			<Chart
				key={type}
				type="pie"
				height={500}
				series={qtys.map(([, qty]) => qty)}
				options={{
					colors: qtys.map(([, , color]) => {
						type A = typeof twColors;
						const [name, variant] = color
							?.replace(/\s(\W|\w)+/, '')
							.replace(/bg-/, '')
							.split('-') as [name: ObjKeyof<A>, variant: ObjKeyof<A['amber']>];
						return twColors[name][variant];
					}),
					labels: qtys.map(([name]) => name),
				}}
			/>
		</>
	);
}

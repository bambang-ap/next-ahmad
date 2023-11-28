import {FormType} from 'pages/app/internal';
import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import type {UU} from '@trpc/routers/internal/dashboard';
import {classNames, numberFormat} from '@utils';
import {trpc} from '@utils/trpc';

type K = {calculated?: boolean} & FormProps<FormType, 'control'>;

export function InternalDashboard({control, calculated}: K) {
	const {from, to} = useWatch({control});

	const {data: dashboardData} = trpc.internal.dashboard.useQuery({from, to});

	const dataEntries = entries(dashboardData);

	function calculateValue(value: number, harga: number, unit: string) {
		const val = numberFormat(value * (calculated ? harga : 1), !!calculated);
		return `${val} ${calculated ? '' : unit}`;
	}

	function findValue({harga1, harga2, qty, unit}: UU) {
		const not1 = !harga1 || harga1 == '0';
		const not2 = !harga2 || harga2 == '0';

		const price = not1 ? (not2 ? '0' : harga2) : harga1;

		return calculateValue(qty, parseFloat(price ?? '0'), unit);
	}

	return (
		<>
			<div className="flex">
				{dataEntries.map(([key, {className, data = []}]) => (
					<div key={key} className="flex flex-col flex-1">
						<div className="p-2 text-center font-bold text-white bg-gray-600">
							{key}
						</div>
						<div>
							{data.map(item => {
								return (
									<>
										<div
											className={classNames(
												'p-2 font-bold text-white',
												{'text-right': calculated},
												className,
											)}>
											{findValue(item)}
										</div>
									</>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</>
	);
}

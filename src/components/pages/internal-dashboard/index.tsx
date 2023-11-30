import {FormType} from 'pages/app/internal';
import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import type {UU} from '@trpc/routers/internal/dashboard';
import {classNames, numberFormat} from '@utils';
import {trpc} from '@utils/trpc';

type K = {calculated?: boolean} & FormProps<FormType, 'control'>;

export function InternalDashboard({control, calculated}: K) {
	const {filterFrom, filterTo} = useWatch({control});

	const {data: dashboardData} = trpc.internal.dashboard.useQuery({
		filterFrom,
		filterTo,
	});

	const dataEntries = entries(dashboardData);

	function calculateValue(
		value: number,
		harga: number,
		unit: string,
		jj = !!calculated,
	) {
		const val = numberFormat(value * (calculated ? harga : 1), jj);
		return `${val} ${calculated ? '' : unit}`;
	}

	function findValue({harga1, harga2, qty, unit}: UU, currency?: boolean) {
		const not1 = !harga1 || harga1 == '0';
		const not2 = !harga2 || harga2 == '0';

		const price = not1 ? (not2 ? '0' : harga2) : harga1;

		return calculateValue(qty, parseFloat(price ?? '0'), unit, currency);
	}

	return (
		<>
			<div className="flex">
				{dataEntries.map(([key, {className, data = []}]) => {
					let total: Record<typeof key, number> = {
						'SJ Masuk': 0,
						LPB: 0,
						PO: 0,
						Stock: 0,
					};

					return (
						<div key={key} className="flex flex-col flex-1">
							<div className="p-2 text-center font-bold text-white bg-gray-600">
								{key}
							</div>
							<div>
								{data.mmap(({item, isLast}) => {
									const itemClassName = classNames(
										'p-2 font-bold text-white',
										{'text-right': calculated},
										className,
									);

									total[key] += parseFloat(
										findValue(item, false).replace(/\./g, ''),
									);

									return (
										<>
											{!calculated && (
												<div className={itemClassName}>{findValue(item)}</div>
											)}
											{calculated && isLast && (
												<div className={itemClassName}>
													{numberFormat(total[key])}
												</div>
											)}
										</>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
}

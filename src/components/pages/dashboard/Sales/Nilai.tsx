import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {TDashboardSalesView} from '@appTypes/app.zod';
import {MenuColorClass, MenuName} from '@enum';
import {UseDateFilterProps} from '@hooks';
import {numberFormat} from '@utils';
import {trpc} from '@utils/trpc';

export type DashboardForm = UseDateFilterProps<{
	chartType: 'bar' | 'line';
	view: TDashboardSalesView;
	withDiscount: boolean;
	id_customer?: string;
}>;

export default function DashboardNilai({control}: FormProps<DashboardForm>) {
	const input = useWatch({control});

	const {data: dataNilai} = trpc.dashboard.sales.nilai.useQuery(input);

	const dataEntries = entries(dataNilai);

	return (
		<>
			<div className="flex">
				{dataEntries.map(([key, values]) => {
					const rClassName = 'child:flex-1 child:p-2';
					return (
						<div key={key} className="flex flex-col flex-1 bg-gray-200">
							<div
								className={classNames(
									'flex font-bold text-white bg-gray-600',
									'child:text-center',
									rClassName,
								)}>
								<div>{MenuName[key]}</div>
								{input.withDiscount && <div>{MenuName[key]} Diskon</div>}
							</div>
							<div>
								{values.map(({total_after, disc_val, unit}) => {
									return (
										<div
											key={unit}
											className={classNames(
												'flex flex-1 justify-end font-bold text-white',
												rClassName,
												'text-right',
												MenuColorClass[key],
											)}>
											<div>{numberFormat(total_after, true)}</div>
											{input.withDiscount && (
												<div>{numberFormat(disc_val, true)}</div>
											)}
										</div>
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

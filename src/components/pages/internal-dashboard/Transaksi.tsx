import {FormType} from 'pages/app/internal';
import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {numberFormat} from '@utils';
import {trpc} from '@utils/trpc';

export function InternalDashboardTransaksi({control}: FormProps<FormType>) {
	const {filterFrom, filterTo} = useWatch({control});

	const {data: dashboardData} = trpc.internal.dashboard.total.useQuery({
		filterFrom,
		filterTo,
		isCalculated: true,
	});

	const dataEntries = entries(dashboardData);

	return (
		<>
			<div className="flex">
				{dataEntries.map(([key, {className, value}]) => {
					return (
						<div key={key} className="flex flex-col flex-1 bg-gray-200">
							<div className="p-2 text-center font-bold text-white bg-gray-600">
								{key}
							</div>
							<div>
								<div
									className={classNames(
										'text-right px-4 py-2 font-bold text-white',
										className,
									)}>
									{numberFormat(value, true)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
}

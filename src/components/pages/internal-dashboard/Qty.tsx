import {FormType} from 'pages/app/internal';
import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {classNames} from '@utils';
import {trpc} from '@utils/trpc';

export function InternalDashboardQty({control}: FormProps<FormType>) {
	const {filterFrom, filterTo} = useWatch({control});

	const {data: dashboardData} = trpc.internal.dashboard.qty.useQuery({
		filterFrom,
		filterTo,
	});

	const dataEntries = entries(dashboardData);

	return (
		<>
			<div className="flex">
				{dataEntries.map(([key, {className, data = []}]) => {
					return (
						<div key={key} className="flex flex-col flex-1 bg-gray-200">
							<div className="p-2 text-center font-bold text-white bg-gray-600">
								{key}
							</div>
							<div>
								{data.mmap(({item}) => {
									const itemClassName = classNames(
										'p-2 font-bold text-white',
										className,
									);

									return (
										<>
											<div className={itemClassName}>
												{item.qty} {item.unit}
											</div>
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

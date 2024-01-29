import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {MenuColorClass, MenuName} from '@enum';
import {UseDateFilterProps} from '@hooks';
import {numberFormat} from '@utils';
import {trpc} from '@utils/trpc';

export type DashboardForm = UseDateFilterProps<{}>;

export default function DashboardNilai({control}: FormProps<DashboardForm>) {
	const input = useWatch({control});

	const {data: dataNilai} = trpc.dashboard.sales.nilai.useQuery(input);

	const dataEntries = entries(dataNilai);

	return (
		<>
			<div className="flex">
				{dataEntries.map(([key, values]) => {
					return (
						<div key={key} className="flex flex-col flex-1 bg-gray-200">
							<div className="p-2 text-center font-bold text-white bg-gray-600">
								{MenuName[key]}
							</div>
							<div>
								{values.map(({total_after, unit}) => {
									return (
										<div
											key={unit}
											className={classNames(
												'flex flex-1 justify-end px-4 py-2 font-bold text-white',
												MenuColorClass[key],
											)}>
											{numberFormat(total_after, true)}
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

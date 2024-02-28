import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {TDashboardSalesView} from '@appTypes/app.zod';
import {Spinner} from '@baseComps/Icon';
import {decimalValue} from '@constants';
import {UseDateFilterProps} from '@hooks';
import {averageScore} from '@utils';
import {trpc} from '@utils/trpc';

export type DashboardForm = UseDateFilterProps<{
	chartType: 'bar' | 'line';
	view: TDashboardSalesView;
	id_customer?: string[];
}>;

export default function DashboardGradeKanban({
	control,
}: FormProps<DashboardForm>) {
	const input = useWatch({control});

	const {data, isLoading} = trpc.dashboard.grade.kanban.useQuery(input);

	const dataEntries = entries(data);

	return (
		<>
			{isLoading && (
				<Spinner className="text-xl self-center">Harap tunggu</Spinner>
			)}
			<div
				className={classNames(
					'flex child:flex-1 child:p-2 -mb-4',
					'child:text-center child:font-bold child:text-lg',
					'child:bg-gray-800 child:text-white',
				)}>
				<div className="!flex-none w-12 ">NO</div>
				<div>Customer</div>
				<div>Poin</div>
				<div>Grade</div>
				<div>Completed Kanban</div>
			</div>
			<div className="flex flex-col">
				{dataEntries.map(([key, values], i) => {
					const rClassName = 'child:p-2';

					const {customer, scores} = values;

					const {point, score} =
						scores.length > 0
							? averageScore(scores)
							: {point: (100).toFixed(decimalValue), score: 'A' as const};

					const isOdd = i % 2 == 0;
					const classes = classNames(
						'flex font-bold',
						'child:p-2 child:text-center child:flex-1',
						rClassName,
						{
							'bg-gray-500 text-white': isOdd,
							'bg-gray-300': !isOdd,
						},
					);

					return (
						<div key={key} className={classes}>
							<div className="!flex-none w-12 align-middle">{i + 1}.</div>
							<div className="!text-left">{customer?.name}</div>
							<div>{point}</div>
							<div>{score}</div>
							<div>{scores.length}</div>
						</div>
					);
				})}
			</div>
		</>
	);
}

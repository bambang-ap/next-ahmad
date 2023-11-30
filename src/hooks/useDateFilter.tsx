import {
	DeepPartial,
	FieldValues,
	useForm,
	UseFormProps,
	UseFormReturn,
} from 'react-hook-form';

import {TDateFilter} from '@appTypes/app.zod';
import {Input} from '@components';
import {dateUtils, moment} from '@utils';

export type UseDateFilterProps<F extends FieldValues> = F & TDateFilter;

export function useDateFilter<T extends TDateFilter & {}>(
	isSameMonth?: boolean,
	options?: UseFormProps<T | TDateFilter>,
) {
	const today = moment();
	const to = dateUtils.readable(today.endOf('month').unix() * 1000)!;
	const from = dateUtils.readable(today.startOf('month').unix() * 1000)!;

	const {defaultValues, ...restOpts} = options ?? {};

	const form = useForm<TDateFilter>({
		...restOpts,
		defaultValues: (isSameMonth
			? {...defaultValues, filterFrom: from, filterTo: to}
			: defaultValues) as DeepPartial<TDateFilter>,
	});

	const dateComponent = (
		<>
			<Input
				type="date"
				fieldName="filterFrom"
				label="Dari Tanggal"
				control={form.control}
			/>
			<Input
				type="date"
				fieldName="filterTo"
				control={form.control}
				label="Sampai Tanggal"
			/>
		</>
	);

	return {form: form as unknown as UseFormReturn<T>, dateComponent};
}

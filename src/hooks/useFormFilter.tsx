import {
	DeepPartial,
	FieldValues,
	useForm,
	UseFormProps,
	UseFormReturn,
} from 'react-hook-form';

import {TDateFilter} from '@appTypes/app.zod';
import {Input, Select, SelectPropsData} from '@components';
import {formatDate} from '@constants';
import {dateUtils, moment} from '@utils';

export type UseDateFilterProps<F extends FieldValues> = F & TDateFilter;

export function useFormFilter<T extends TDateFilter & {}>(
	isSameMonth?: boolean,
	options?: UseFormProps<T | TDateFilter>,
) {
	const today = moment();
	const to = dateUtils.readable(today.endOf('month').unix() * 1000)!;
	const from = dateUtils.readable(today.startOf('month').unix() * 1000)!;

	const {defaultValues, ...restOpts} = options ?? {};

	const months: SelectPropsData<number>[] = Array.from({length: 12}).map(
		(_, i) => {
			const currentMonth = moment().startOf('year').add(i, 'month');

			return {
				label: currentMonth.format('MMMM'),
				value: currentMonth.get('months'),
			};
		},
	);

	const years: SelectPropsData<number>[] = Array.from({length: 15}).map(
		(_, i) => {
			return {value: i + 2023};
		},
	);

	const form = useForm<TDateFilter>({
		...restOpts,
		defaultValues: (isSameMonth
			? {
					...defaultValues,
					filterFrom: from,
					filterTo: to,
					filterMonth: today.get('month'),
					filterYear: today.get('year'),
			  }
			: defaultValues) as DeepPartial<TDateFilter>,
	});

	const {filterYear, filterMonth} = form.watch();

	const daysSelectedDate = moment(`${filterYear}-${filterMonth + 1}-20`);
	const days = Array.from({
		length: daysSelectedDate.endOf('month').get('dates'),
	}).map((_, i) => {
		const currentMonth = daysSelectedDate.startOf('month').add(i, 'day');

		return currentMonth.format(formatDate);
	});

	const fromToComponent = (
		<>
			<Input
				className="flex-1"
				type="date"
				fieldName="filterFrom"
				label="Dari Tanggal"
				control={form.control}
			/>
			<Input
				className="flex-1"
				type="date"
				fieldName="filterTo"
				control={form.control}
				label="Sampai Tanggal"
			/>
		</>
	);

	const monthYearComponent = (
		<>
			<Select
				className="flex-1"
				label="Tahun"
				data={years}
				topSelected={false}
				control={form.control}
				fieldName="filterYear"
			/>
			<Select
				className="flex-1"
				label="Bulan"
				data={months}
				topSelected={false}
				control={form.control}
				fieldName="filterMonth"
			/>
		</>
	);

	return {
		days,
		fromToComponent,
		daysSelectedDate,
		monthYearComponent,
		form: form as unknown as UseFormReturn<T>,
	};
}

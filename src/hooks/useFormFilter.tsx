import {useEffect} from 'react';

import {
	DeepPartial,
	FieldValues,
	useForm,
	UseFormProps,
	UseFormReturn,
} from 'react-hook-form';

import {TDateFilter} from '@appTypes/app.zod';
import {Input, Select} from '@components';
import {formatDate} from '@constants';
import {dateUtils, getMoments, moment} from '@utils';

export type UseDateFilterProps<F extends FieldValues> = F & TDateFilter;

export function useFormFilter<T extends TDateFilter & {}>(
	options?: UseFormProps<T | TDateFilter> & {sameMonth?: boolean},
) {
	const today = moment();
	const to = dateUtils.readable(today.endOf('month').unix() * 1000)!;
	const from = dateUtils.readable(today.startOf('month').unix() * 1000)!;

	const {defaultValues, sameMonth, ...restOpts} = options ?? {};

	const form = useForm<TDateFilter>({
		...restOpts,
		defaultValues: (sameMonth
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

	const {days, months, years} = getMoments(daysSelectedDate);

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

	function MonthYear({hideMonth}: {hideMonth?: boolean}) {
		return (
			<>
				<Select
					className="flex-1"
					label="Tahun"
					data={years}
					control={form.control}
					fieldName="filterYear"
				/>
				{!hideMonth && (
					<Select
						className="flex-1"
						label="Bulan"
						data={months}
						control={form.control}
						fieldName="filterMonth"
					/>
				)}
			</>
		);
	}

	useEffect(() => {
		if (!!filterYear) {
			form.reset(prev => {
				const {filterFrom, filterTo} = prev;
				return {
					...prev,
					filterFrom: moment(filterFrom)
						.set('year', parseInt(filterYear))
						.format(formatDate),
					filterTo: moment(filterTo)
						.set('year', parseInt(filterYear))
						.format(formatDate),
				};
			});
		}
	}, [filterYear]);

	useEffect(() => {
		if (!!filterMonth) {
			form.reset(prev => {
				const {filterFrom, filterTo} = prev;
				return {
					...prev,
					filterFrom: moment(filterFrom)
						.set('month', filterMonth)
						.format(formatDate),
					filterTo: moment(filterTo)
						.set('month', filterMonth)
						.format(formatDate),
				};
			});
		}
	}, [filterMonth]);

	return {
		days,
		fromToComponent,
		daysSelectedDate,
		MonthYear,
		form: form as unknown as UseFormReturn<T>,
	};
}

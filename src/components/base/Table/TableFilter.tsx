import {useEffect} from 'react';

import {Pagination} from '@mui/material';
import {useForm, UseFormReturn} from 'react-hook-form';

import {PagingResult, TableFormValue} from '@appTypes/app.type';
import {Button, Cells, Input, Select, Table, TableProps} from '@components';
import {dataPerPageSelection} from '@constants';
import {classNames} from '@utils';

export type TableFilterProps<T> = Omit<
	TableProps<T, Cells>,
	'bottomComponent' | 'data'
> & {
	data?: PagingResult<T>;
	form: UseFormReturn<TableFormValue>;
	disableSearch?: boolean;
};

export function TableFilter<T>({
	data,
	form,
	className,
	topComponent,
	disableSearch,
	...props
}: TableFilterProps<T>) {
	const {control, watch, reset: resetForm} = form;
	const {rows = [], totalPage: pageCount = 1, page = 1} = data ?? {};

	const {
		reset,
		handleSubmit,
		control: searchControl,
	} = useForm({defaultValues: {search: ''}});

	const formValue = watch();

	const searching = formValue.search && formValue.search.length > 0;

	const doSearch = handleSubmit(({search}) => {
		resetForm(prev => ({...prev, search}));
	});

	function clearSearch() {
		reset({search: ''});
		doSearch();
	}

	useEffect(() => {
		resetForm(prev => ({...prev, pageTotal: pageCount}));
		if (page > pageCount) resetForm(prev => ({...prev, page: 1}));
	}, [pageCount, page]);

	useEffect(() => {
		reset({search: formValue.search});

		return () => reset({search: ''});
	}, [formValue.search]);

	return (
		<Table
			{...props}
			data={rows}
			className={classNames('flex flex-col gap-2', className)}
			topComponent={
				<div className="px-2 flex justify-between">
					<div className="flex items-center gap-2">{topComponent}</div>
					<div className="flex gap-2 w-1/2">
						<Select
							className={classNames({['flex-1']: disableSearch})}
							disableClear
							label="Data per halaman"
							data={dataPerPageSelection}
							control={control}
							fieldName="limit"
						/>
						{!disableSearch && (
							<form onSubmit={doSearch} className="flex-1">
								<Input
									label="Pencarian"
									fieldName="search"
									control={searchControl}
									rightAcc={
										<div className="flex gap-2">
											{searching && (
												<Button icon="faClose" onClick={clearSearch} />
											)}
											<Button icon="faSearch" onClick={doSearch} />
										</div>
									}
								/>
							</form>
						)}
					</div>
				</div>
			}
			bottomComponent={
				<div className="px-2 flex justify-center">
					<Pagination
						// eslint-disable-next-line @typescript-eslint/no-shadow
						onChange={(_, page) => resetForm(prev => ({...prev, page}))}
						count={Number(formValue?.pageTotal ?? 1)}
					/>
				</div>
			}
		/>
	);
}

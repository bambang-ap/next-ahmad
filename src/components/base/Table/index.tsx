import {FC, Fragment, useEffect} from 'react';

import {Pagination, TableCellProps} from '@mui/material';
import {useForm, UseFormReturn} from 'react-hook-form';

import {TableFormValue} from '@appTypes/app.type';
import {Input, Select, SelectPropsData} from '@components';
import {defaultLimit} from '@constants';
import {classNames} from '@utils';

import RootTable from './RootTable';

type TRenderItem<T, R, V = {}> = (value: MMapValue<T> & V, index: number) => R;

export type Cells = {Cell: FC<TableCellProps>};

export type TableProps<T, Cell = {}> = {
	data?: T[];
	className?: string;
	header?: (string | false | [title: string, colSpan: number])[];
	renderItem?: TRenderItem<T, JSX.Element | JSX.Element[] | false, Cell>;
	renderItemEach?: TRenderItem<T, JSX.Element | false, Cell>;
	topComponent?: JSX.Element;
	bottomComponent?: JSX.Element;
};

export type TableFilterProps<T> = Omit<
	TableProps<T, Cells>,
	'topComponent' | 'bottomComponent'
> & {
	form: UseFormReturn<TableFormValue>;
	pageCount?: number;
};

export {RootTable};

export function TableFilter<T>({
	form,
	pageCount = 1,
	...props
}: TableFilterProps<T>) {
	const {control, watch, setValue} = form;
	const {
		control: searchControl,
		reset,
		handleSubmit,
	} = useForm({
		defaultValues: {search: ''},
	});
	const formValue = watch();

	const selectData = Array.from({length: 10}).map<SelectPropsData>((_, i) => ({
		value: (i + 1) * defaultLimit,
	}));

	const doSearch = handleSubmit(({search}) => {
		setValue('search', search);
	});

	useEffect(() => {
		setValue('pageTotal', pageCount);
		if (formValue.page > pageCount) setValue('page', 1);
	}, [pageCount]);

	useEffect(() => {
		reset({search: formValue.search});

		return () => reset({search: ''});
	}, [formValue.search]);

	return (
		<Table
			{...props}
			topComponent={
				<div className="flex justify-between">
					<Select data={selectData} control={control} fieldName="limit" />
					<form onSubmit={doSearch} className="w-1/2">
						<Input control={searchControl} fieldName="search" />
					</form>
				</div>
			}
			bottomComponent={
				<Pagination
					onChange={(_, v) => setValue('page', v)}
					count={Number(formValue?.pageTotal ?? 1)}
				/>
			}
		/>
	);
}

export function Table<T>(props: TableProps<T, Cells>) {
	const {
		data,
		header,
		className,
		renderItem,
		renderItemEach,
		bottomComponent,
		topComponent,
	} = props;

	if (!data) return null;

	return (
		<div className={classNames('w-full', className)}>
			{topComponent}
			<RootTable>
				{header && (
					<RootTable.THead>
						<RootTable.Tr>
							{header.map(head => {
								if (!head) return null;
								if (typeof head === 'string')
									return <RootTable.Td key={head}>{head}</RootTable.Td>;

								const [title, colSpan] = head;
								return (
									<RootTable.Td colSpan={colSpan} key={title}>
										{title}
									</RootTable.Td>
								);
							})}
						</RootTable.Tr>
					</RootTable.THead>
				)}
				<RootTable.TBody>
					{data.mmap((item, index) => {
						const itemWithCell = {...item, Cell: RootTable.Td};
						const renderEach = renderItemEach?.(itemWithCell, index);
						const renderItemRow = renderItem?.(itemWithCell, index);

						return (
							<Fragment key={index}>
								<RootTable.Tr className={classNames({hidden: !renderItemRow})}>
									{renderItemRow}
								</RootTable.Tr>

								{renderEach && renderItemEach && (
									<RootTable.Tr>{renderEach}</RootTable.Tr>
								)}
							</Fragment>
						);
					})}
				</RootTable.TBody>
			</RootTable>
			{bottomComponent}
		</div>
	);
}

import {FC, Fragment, isValidElement, useEffect} from "react";

import {Pagination, TableCellProps} from "@mui/material";
import {useForm, UseFormReturn} from "react-hook-form";

import {PagingResult, TableFormValue} from "@appTypes/app.type";
import {Button, Input, Select, SelectPropsData} from "@components";
import {defaultLimit} from "@constants";
import {classNames} from "@utils";

import TableRoot from "./TableRoot";

export * from "./TableRoot";
export {TableRoot as RootTable};

type TRenderItem<T, R, V = {}> = (value: MMapValue<T> & V, index: number) => R;

export type Cells = {Cell: FC<TableCellProps>};

export type TableProps<T, Cell = {}> = {
	data?: T[];
	className?: string;
	header?: OptionalUnion<
		// Empty String
		"∂",
		| React.ReactElement<unknown>
		| string
		| false
		| [title: string, colSpan: number]
	>[];
	renderItem?: TRenderItem<T, JSX.Element | JSX.Element[] | false, Cell>;
	renderItemEach?: TRenderItem<T, JSX.Element | false, Cell>;
	reverseEachItem?: boolean;
	topComponent?: JSX.Element;
	bottomComponent?: JSX.Element;
};

export type TableFilterProps<T> = Omit<
	TableProps<T, Cells>,
	"bottomComponent" | "data"
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
	const {control, watch, setValue} = form;
	const {rows = [], totalPage: pageCount = 1} = data ?? {};

	const {
		reset,
		handleSubmit,
		control: searchControl,
	} = useForm({defaultValues: {search: ""}});

	const formValue = watch();
	const searching = formValue.search && formValue.search.length > 0;
	const selectData = Array.from({length: 10}).map<SelectPropsData>((_, i) => ({
		// @ts-ignore
		value: (i + 1) * defaultLimit,
	}));

	const doSearch = handleSubmit(({search}) => {
		setValue("search", search);
	});

	function clearSearch() {
		reset({search: ""});
		doSearch();
	}

	useEffect(() => {
		setValue("pageTotal", pageCount);
		if (formValue.page > pageCount) setValue("page", 1);
	}, [pageCount]);

	useEffect(() => {
		reset({search: formValue.search});

		return () => reset({search: ""});
	}, [formValue.search]);

	return (
		<Table
			{...props}
			data={rows}
			className={classNames("flex flex-col gap-2", className)}
			topComponent={
				<div className="px-2 flex justify-between">
					<div className="flex items-center gap-2">{topComponent}</div>
					<div className="flex gap-2 w-1/2">
						<Select
							className={classNames({["flex-1"]: disableSearch})}
							disableClear
							label="Data per halaman"
							data={selectData}
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
						onChange={(_, v) => setValue("page", v)}
						count={Number(formValue?.pageTotal ?? 1)}
					/>
				</div>
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
		reverseEachItem = false,
		bottomComponent,
		topComponent,
	} = props;

	if (!data) return null;

	const {TBody, THead, Td, Tr} = TableRoot;

	return (
		<div className={classNames("w-full", className)}>
			{topComponent}
			<TableRoot>
				{header && (
					<THead>
						<Tr>
							{header.map(head => {
								if (!head) return null;
								if (isValidElement(head)) return <Td key="headJsx">{head}</Td>;
								if (head === "∂") return <Td key={head} />;
								if (typeof head === "string") return <Td key={head}>{head}</Td>;

								// @ts-ignore
								const [title, colSpan] = head;
								return (
									<Td colSpan={colSpan} key={title}>
										{title}
									</Td>
								);
							})}
						</Tr>
					</THead>
				)}
				<TBody>
					{data.mmap((item, index) => {
						const itemWithCell = {...item, Cell: Td};
						const renderEach = renderItemEach?.(itemWithCell, index);
						const renderItemRow = renderItem?.(itemWithCell, index);

						const eachRenderer = renderEach && renderItemEach && (
							<Tr>{renderEach}</Tr>
						);

						return (
							<Fragment key={index}>
								{reverseEachItem && eachRenderer}
								<Tr className={classNames({hidden: !renderItemRow})}>
									{renderItemRow}
								</Tr>
								{!reverseEachItem && eachRenderer}
							</Fragment>
						);
					})}
				</TBody>
			</TableRoot>
			{bottomComponent}
		</div>
	);
}

import {FC, Fragment, isValidElement, useState} from 'react';

import {TableCellProps} from '@mui/material';
import {FieldValues} from 'react-hook-form';

import {Input, InputProps, Spinner} from '@components';
import {WrappedProps} from '@formController';
import {classNames} from '@utils';

import TableRoot from './TableRoot';

export * from './BorderTd';
export * from './TableRoot';
export {TableRoot as RootTable};

export type VRenderItem<T, V = Cells> = MMapValue<T> & V;
export type TRenderItem<T, R, V = {}> = (
	value: VRenderItem<T, V>,
	index: number,
	items: T[],
) => R;

export type CellSelectProps<F extends FieldValues> = Omit<
	WrappedProps<F, InputProps>,
	'type'
> & {
	CellProps?: TableCellProps;
};

export function CellSelect<F extends FieldValues>({
	CellProps,
	...props
}: CellSelectProps<F>) {
	return (
		<TableRoot.Td width={50} {...CellProps}>
			<Input type="checkbox" {...props} />
		</TableRoot.Td>
	);
}

export type Cells = {Cell: FC<TableCellProps>};

export type TableProps<T = any, Cell = {}> = {
	data?: T[];
	className?: string;
	header?: OptionalUnion<
		// Empty String
		'∂',
		| React.ReactElement<unknown>
		| string
		| false
		| [title: string, colSpan: number]
	>[];
	isLoading?: boolean;
	loaderComponent?: JSX.Element;
	keyExtractor?: (item: T, index: number) => string | undefined;
	renderItem?: TRenderItem<T, JSX.Element | JSX.Element[] | false, Cell>;
	renderItemEach?: TRenderItem<T, JSX.Element | false, Cell>;
	reverseEachItem?: boolean;
	topComponent?: JSX.Element | null | false;
	bottomComponent?: JSX.Element;
};

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
		keyExtractor,
		loaderComponent,
		isLoading,
	} = props;

	const [tableKey] = useState(uuid());

	const {TBody, THead, Td, Tr} = TableRoot;

	const renderData =
		isLoading !== undefined && isLoading ? (
			<Tr>
				<Td className="justify-center" colSpan={header?.filter(Boolean).length}>
					{loaderComponent || (
						<div className="animate-pulse">
							<Spinner />
						</div>
					)}
				</Td>
			</Tr>
		) : (
			data &&
			(data.length > 0 ? (
				data.mmap((item, index) => {
					const itemWithCell = {...item, Cell: Td};
					const renderEach = renderItemEach?.(itemWithCell, index, data);
					const renderItemRow = renderItem?.(itemWithCell, index, data);
					const key = keyExtractor?.(item.item, index) ?? index;

					const eachRenderer = renderEach && renderItemEach && (
						<Tr>{renderEach}</Tr>
					);

					return (
						<Fragment key={key}>
							{reverseEachItem && eachRenderer}
							<Tr className={classNames({hidden: !renderItemRow})}>
								{renderItemRow}
							</Tr>
							{!reverseEachItem && eachRenderer}
						</Fragment>
					);
				})
			) : (
				<></>
			))
		);

	return (
		<div
			key={tableKey}
			className={classNames('flex flex-col w-full gap-2', className)}>
			{topComponent}
			<TableRoot>
				{header && (
					<THead>
						<Tr>
							{header.map(head => {
								if (!head) return null;
								if (isValidElement(head)) return <Td key="headJsx">{head}</Td>;
								if (head === '∂') return <Td key={head} />;
								if (typeof head === 'string') return <Td key={head}>{head}</Td>;

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
				<TBody>{renderData}</TBody>
			</TableRoot>
			{bottomComponent}
		</div>
	);
}

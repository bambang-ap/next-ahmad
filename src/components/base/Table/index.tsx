import {FC, Fragment} from 'react';

import {TableCellProps} from '@mui/material';

import {classNames} from '@utils';

import RootTable from './RootTable';

type TRenderItem<T, R, V = {}> = (value: MMapValue<T> & V, index: number) => R;

export type Cells = {Cell: FC<TableCellProps>};

export type TableProps<T, Cell = {}> = {
	data?: T[];
	header?: (string | false | [title: string, colSpan: number])[];
	className?: string;
	renderItem?: TRenderItem<T, JSX.Element | JSX.Element[] | false, Cell>;
	renderItemEach?: TRenderItem<T, JSX.Element | false, Cell>;
};

export {RootTable};

export const Table = <T,>(props: TableProps<T, Cells>) => {
	const {data, header, className, renderItem, renderItemEach} = props;

	if (!data) return null;

	return (
		<div className={classNames('w-full', className)}>
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
		</div>
	);
};

import {FC, Fragment} from 'react';

import {Table as TableFb, TableCellProps} from 'flowbite-react';

import {classNames} from '@utils';

type TRenderItem<T, R, V = {}> = (value: MMapValue<T> & V, index: number) => R;

export type Cells = {Cell: FC<TableCellProps>};

export type TableProps<T, Cell = {}> = {
	data?: T[];
	header?: (string | false | [title: string, colSpan: number])[];
	className?: string;
	renderItem?: TRenderItem<T, JSX.Element | JSX.Element[] | false, Cell>;
	renderItemEach?: TRenderItem<T, JSX.Element | false, Cell>;
};

export const Table = <T,>(props: TableProps<T, Cells>) => {
	const {data, header, className, renderItem, renderItemEach} = props;

	if (!data) return null;

	return (
		<div className={classNames('w-full', className)}>
			<TableFb striped>
				{header && (
					<TableFb.Head>
						{header.map(head => {
							if (!head) return null;
							if (typeof head === 'string')
								return <TableFb.HeadCell key={head}>{head}</TableFb.HeadCell>;

							const [title, colSpan] = head;
							return (
								<TableFb.HeadCell colSpan={colSpan} key={title}>
									{title}
								</TableFb.HeadCell>
							);
						})}
					</TableFb.Head>
				)}
				<TableFb.Body>
					{data.mmap((item, index) => {
						const itemWithCell = {...item, Cell: TableFb.Cell};
						const renderEach = renderItemEach?.(itemWithCell, index);
						const renderItemRow = renderItem?.(itemWithCell, index);

						return (
							<Fragment key={index}>
								<TableFb.Row
									className={classNames({['!hidden']: !renderItemRow})}>
									{renderItemRow}
								</TableFb.Row>

								{renderEach && renderItemEach && (
									<TableFb.Row>{renderEach}</TableFb.Row>
								)}
							</Fragment>
						);
					})}
				</TableFb.Body>
			</TableFb>
		</div>
	);
};

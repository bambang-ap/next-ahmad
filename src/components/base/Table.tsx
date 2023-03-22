import {FC, Fragment} from 'react';

import {
	Paper,
	styled,
	Table as TableMUI,
	TableBody,
	TableCell,
	TableCellProps,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';

import {classNames} from '@utils';

type TRenderItem<T, R, V = {}> = (value: MMapValue<T> & V, index: number) => R;

const StyledTableCell = styled(TableCell)({
	padding: 8,
});

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
			<TableContainer component={Paper}>
				<TableMUI>
					{header && (
						<TableHead>
							<TableRow>
								{header.map(head => {
									if (!head) return null;
									if (typeof head === 'string')
										return <StyledTableCell key={head}>{head}</StyledTableCell>;

									const [title, colSpan] = head;
									return (
										<StyledTableCell colSpan={colSpan} key={title}>
											{title}
										</StyledTableCell>
									);
								})}
							</TableRow>
						</TableHead>
					)}
					<TableBody>
						{data.mmap((item, index) => {
							const itemWithCell = {...item, Cell: StyledTableCell};
							const renderEach = renderItemEach?.(itemWithCell, index);
							const renderItemRow = renderItem?.(itemWithCell, index);

							return (
								<Fragment key={index}>
									<TableRow
										className={classNames({['!hidden']: !renderItemRow})}>
										{renderItemRow}
									</TableRow>

									{renderEach && renderItemEach && (
										<TableRow>{renderEach}</TableRow>
									)}
								</Fragment>
							);
						})}
					</TableBody>
				</TableMUI>
			</TableContainer>
		</div>
	);
};

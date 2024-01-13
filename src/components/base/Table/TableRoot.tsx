import {
	Paper,
	styled,
	Table as TableMUI,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableProps,
	TableRow,
} from '@mui/material';

import {classNames} from '@utils';

export type StyledCellProps = GetProps<typeof StyledTableCell>;

const StyledTableCell = styled(TableCell)(({valign}) => ({
	padding: 8,
	verticalAlign: valign,
}));

const StyledCell = ({
	children,
	hidden,
	className,
	...rest
}: StyledCellProps) => {
	return (
		<StyledTableCell {...rest}>
			<div className={classNames('flex', {hidden}, className)}>{children}</div>
		</StyledTableCell>
	);
};

const Table = Object.assign(TableRoot, {
	THead: TableHead,
	TBody: TableBody,
	Tr: TableRow,
	Td: StyledCell,
});

TableRoot.displayName = 'Table';
function TableRoot({children, ...rest}: TableProps) {
	return (
		<TableContainer component={Paper}>
			<TableMUI {...rest}>{children}</TableMUI>
		</TableContainer>
	);
}

export default Table;

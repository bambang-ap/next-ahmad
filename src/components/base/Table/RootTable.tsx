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

const StyledTableCell = styled(TableCell)(({valign}) => ({
	padding: 4,
	verticalAlign: valign,
}));

const StyledCell = ({
	children,
	className,
	...rest
}: GetProps<typeof StyledTableCell>) => {
	return (
		<StyledTableCell {...rest}>
			<div className={classNames('flex', className)}>{children}</div>
		</StyledTableCell>
	);
};

const Table = Object.assign(RootTable, {
	THead: TableHead,
	TBody: TableBody,
	Tr: TableRow,
	Td: StyledCell,
});

RootTable.displayName = 'Table';
function RootTable({children, ...rest}: TableProps) {
	return (
		<TableContainer component={Paper}>
			<TableMUI {...rest}>{children}</TableMUI>
		</TableContainer>
	);
}

export default Table;

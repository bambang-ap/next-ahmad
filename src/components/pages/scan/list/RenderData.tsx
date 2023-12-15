import {PropsWithChildren} from 'react';

import {Route} from 'pages/app/scan/[route]';
import {ScanListFormType} from 'pages/app/scan/[route]/list';
import {Control, useWatch} from 'react-hook-form';

import {TableFilterProps} from '@hooks';
import type {ScanList} from '@trpc/routers/scan';
import {dateUtils, modalTypeParser, renderIndex} from '@utils';

type Props = {
	index: number;
	control: Control<ScanListFormType>;
	printOne?: (idKanban: string) => void;
} & GetProps<
	NonNullable<TableFilterProps<ScanList, ScanListFormType>['renderItem']>
> &
	Route;

export function RenderData(props: PropsWithChildren<Props>) {
	const {Cell, item, children, control, CellSelect, index} = props;

	const {type: modalType} = useWatch({control});

	const {isSelect} = modalTypeParser(modalType);

	const data = item.dKanban;
	const date = item.updatedAt;
	const theDate = !date ? '' : dateUtils.full(date);

	return (
		<>
			{isSelect && <CellSelect fieldName={`idScans.${item.id}`} />}
			<Cell>{index + 1}</Cell>
			<Cell>{dateUtils.date(data?.createdAt)}</Cell>
			<Cell>{data.dPo.dCust.name}</Cell>
			<Cell>{data.dPo.nomor_po}</Cell>
			<Cell>{data.dSJIn.nomor_surat}</Cell>
			<Cell>{renderIndex(data, data.nomor_kanban!)}</Cell>
			<Cell>{data?.keterangan}</Cell>
			<Cell>{theDate}</Cell>
			{!isSelect && (
				<Cell className="flex gap-2">
					{/* <Button icon="faPrint" onClick={() => printOne?.(item.id_kanban)} /> */}
					{children}
				</Cell>
			)}
		</>
	);
}

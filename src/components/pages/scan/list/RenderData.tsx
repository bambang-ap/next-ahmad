import {PropsWithChildren} from "react";

import {Route} from "pages/app/scan/[route]";
import {ScanListFormType} from "pages/app/scan/[route]/list";
import {Control, useWatch} from "react-hook-form";

import {Cells, CellSelect} from "@components";
import type {ScanList} from "@trpc/routers/scan";
import {dateUtils, modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

export function RenderData({
	Cell,
	item,
	children,
	route,
	control,
}: // printOne,
PropsWithChildren<
	MMapValue<ScanList> &
		Cells &
		Route & {
			control: Control<ScanListFormType>;
			printOne?: (idKanban: string) => void;
		}
>) {
	const {data} = trpc.kanban.detail.useQuery(item.id_kanban as string);

	const [modalType, idKanbans] = useWatch({
		control,
		name: ["type", "idKanbans"],
	});
	const {isSelect} = modalTypeParser(modalType);
	const date = item.date?.[`${route}_updatedAt`];
	const theDate = !date ? "" : dateUtils.full(date);

	return (
		<>
			{isSelect && (
				<CellSelect
					noLabel
					control={control}
					key={`${idKanbans?.[item.id_kanban]}`}
					fieldName={`idKanbans.${item.id_kanban}`}
				/>
			)}
			<Cell>{dateUtils.date(data?.createdAt)}</Cell>
			<Cell>{data?.nomor_kanban}</Cell>
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

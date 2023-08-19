import {PropsWithChildren} from "react";

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
	control,
}: // printOne,
PropsWithChildren<
	MMapValue<ScanList> &
		Cells & {
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
			{!isSelect && (
				<Cell className="flex gap-2">
					{/* <Button icon="faPrint" onClick={() => printOne?.(item.id_kanban)} /> */}
					{children}
				</Cell>
			)}
		</>
	);
}

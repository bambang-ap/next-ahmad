import {useEffect, useRef} from "react";

import {useRouter} from "next/router";
import {KanbanFormType} from "pages/app/kanban";
import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import {TScan} from "@appTypes/app.type";
import {Button, Cells, Form, Modal, ModalRef, TableFilter} from "@components";
import {getLayout} from "@hoc";
import {useKanban, useTableFilter} from "@hooks";
import {KanbanModalChild} from "@pageComponent/kanban_ModalChild";
import {atomHeaderTitle} from "@recoil/atoms";
import {dateUtils, modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

import {Route} from "./";

ListScanData.getLayout = getLayout;

export default function ListScanData() {
	useKanban();

	const modalRef = useRef<ModalRef>(null);
	const setTitle = useSetRecoilState(atomHeaderTitle);

	const {isReady, ...router} = useRouter();
	const {route} = router.query as Route;

	const {formValue, hookForm} = useTableFilter();
	const {data} = trpc.scan.list.useQuery({...formValue, target: route});
	const {control, watch, reset} = useForm<KanbanFormType>();

	const [modalType] = watch(["type"]);

	const {isPreview, modalTitle} = modalTypeParser(modalType);

	function preview(id: string) {
		// setIdKanban(id);
		reset({id, type: "preview"});
		modalRef.current?.show();
	}

	useEffect(() => {
		if (isReady && route) {
			const routeTitle = route.split("_").join(" ").ucwords();
			setTitle(`List ${routeTitle}`);
		}
	}, [isReady, route]);

	if (!isReady) return null;

	return (
		<>
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form context={{disabled: isPreview, hideButton: isPreview}}>
					<KanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>

			<TableFilter
				data={data}
				form={hookForm}
				header={["Tanggal", "Nomor Kanban", "Keterangan", "Action"]}
				renderItem={item => {
					const {Cell} = item;
					return (
						<>
							<RenderData {...item} />
							<Cell className="flex gap-2">
								<Button
									icon="faPrint"
									onClick={() => preview(item.item.id_kanban)}
								/>
								<Button
									icon="faMagnifyingGlass"
									onClick={() => preview(item.item.id_kanban)}
								/>
							</Cell>
						</>
					);
				}}
			/>
		</>
	);
}

function RenderData({Cell, item}: MMapValue<TScan> & Cells) {
	const {data} = trpc.kanban.detail.useQuery(item.id_kanban as string);

	return (
		<>
			<Cell>{dateUtils.date(data?.createdAt)}</Cell>
			<Cell>{data?.nomor_kanban}</Cell>
			<Cell>{data?.keterangan}</Cell>
		</>
	);
}

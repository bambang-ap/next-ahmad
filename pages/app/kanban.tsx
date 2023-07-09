/* eslint-disable @typescript-eslint/no-unused-vars */

import {FormEventHandler, useEffect, useRef} from "react";

import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import ExportData from "@appComponent/ExportData";
import {ModalTypePreview, TKanbanUpsert} from "@appTypes/app.zod";
import {Button, Form, Modal, ModalRef, TableFilter} from "@components";
import {defaultErrorMutation} from "@constants";
import {getLayout} from "@hoc";
import {useTableFilter} from "@hooks";
import {KanbanGenerateQR} from "@pageComponent/kanban_GenerateQR";
import {KanbanModalChild} from "@pageComponent/kanban_ModalChild";
import {atomDataKanban} from "@recoil/atoms";
import {dateUtils, modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

Kanban.getLayout = getLayout;

export type KanbanFormType = TKanbanUpsert & {
	type: ModalTypePreview;
	id_customer: string;
	temp_id_item: string;
	callbacks?: Array<() => void>;
};

export default function Kanban() {
	const modalRef = useRef<ModalRef>(null);
	const setKanbanTableForm = useSetRecoilState(atomDataKanban);

	const {formValue, hookForm} = useTableFilter({limit: 5});
	const {control, watch, reset, clearErrors, handleSubmit} =
		useForm<KanbanFormType>();
	const {data: dataKanbanPage, refetch} = trpc.kanban.getPage.useQuery(
		formValue!,
		{enabled: !!formValue},
	);

	const {mutate: mutateUpsert} =
		trpc.kanban.upsert.useMutation(defaultErrorMutation);
	const {mutate: mutateDelete} =
		trpc.kanban.delete.useMutation(defaultErrorMutation);

	const [modalType] = watch(["type"]);
	const {isPreview, modalTitle} = modalTypeParser(modalType, "Kanban");

	const useEffectDeps = [dataKanbanPage].map(e => {
		if (!e) return "";
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {rows, ...rest} = e;
		return JSON.stringify(rest);
	});

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(
			async ({nomor_kanban, type, callbacks, list_mesin = {}, ...rest}) => {
				if (callbacks) callbacks.forEach(callback => callback());

				switch (type) {
					case "add":
					case "edit":
						return mutateUpsert({...rest, list_mesin}, {onSuccess});
					case "delete":
						return mutateDelete({id: rest.id}, {onSuccess});
					default:
						return null;
				}
			},
		)();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<Omit<KanbanFormType, "type">>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	useEffect(() => {
		// FIXME:
		// @ts-ignore
		if (!!dataKanbanPage) setKanbanTableForm(dataKanbanPage?.rows);
	}, useEffectDeps);

	return (
		<>
			<TableFilter
				form={hookForm}
				data={dataKanbanPage}
				header={["Tanggal", "Nomor Kanban", "Keterangan", "Action"]}
				topComponent={
					<>
						<Button onClick={() => showModal("add", {})}>Add</Button>
						<ExportData
							names={["Kanban"]}
							useQuery={() => trpc.kanban.get.useQuery({type: "kanban"})}
							dataMapper={dataKanban => {
								if (!dataKanban) return [];
								return dataKanban?.map(
									({
										items,
										list_mesin,
										OrmDocument,
										OrmCustomerPO,
										dataSppbIn,
										dataCreatedBy,
										image,
										dataUpdatedBy,
										createdBy,
										...rest
									}) => rest,
								);
							}}
						/>
					</>
				}
				renderItem={({Cell, item}) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {...rest} = item;
					return (
						<>
							<Cell>{dateUtils.date(item.createdAt)}</Cell>
							<Cell>{item.nomor_kanban}</Cell>
							<Cell>{item.keterangan}</Cell>
							<Cell className="flex gap-x-2">
								<KanbanGenerateQR idKanban={[item.id]} />
								<Button
									icon="faMagnifyingGlass"
									onClick={() => showModal("preview", rest)}
								/>
								<Button onClick={() => showModal("edit", rest)} icon="faEdit" />
								<Button
									onClick={() => showModal("delete", {id: item.id})}
									icon="faTrash"
								/>
							</Cell>
						</>
					);
				}}
			/>

			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{disabled: isPreview, hideButton: isPreview}}>
					<KanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>
		</>
	);
}

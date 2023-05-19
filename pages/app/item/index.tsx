import {FormEventHandler, useRef} from "react";

import {useForm} from "react-hook-form";

import {ModalTypePreview, PagingResult} from "@appTypes/app.type";
import {TMasterItem} from "@appTypes/app.zod";
import {Button, Form, Modal, ModalRef, TableFilter} from "@components";
import {CRUD_ENABLED} from "@enum";
import {getLayout} from "@hoc";
import {useTableFilter} from "@hooks";
import {modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

import {ModalChild} from "./ModalChild";

MasterItem.getLayout = getLayout;

export type FormType = TMasterItem & {
	type: ModalTypePreview;
};

export default function MasterItem() {
	const modalRef = useRef<ModalRef>(null);

	const {formValue, hookForm} = useTableFilter();
	const {mutate} = trpc.basic.mutate.useMutation<string>();
	const {data, refetch} = trpc.basic.getPage.useQuery<
		any,
		PagingResult<TMasterItem>
	>({
		...formValue,
		searchKey: ["name", "kode_item"],
		target: CRUD_ENABLED.ITEM,
	});

	const {control, handleSubmit, watch, clearErrors, reset} =
		useForm<FormType>();

	const [modalType] = watch(["type"]);
	const {modalTitle, isPreview} = modalTypeParser(modalType);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async ({type, id, ...body}) => {
			switch (type) {
				case "add":
				case "edit":
					return mutate(
						{type, target: CRUD_ENABLED.ITEM, body: {...body, id}},
						{onSuccess},
					);
				case "delete":
					return mutate(
						{type, target: CRUD_ENABLED.ITEM, body: {id}},
						{onSuccess},
					);
				default:
					return null;
			}
		})();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(type: ModalTypePreview, initValue: Partial<TMasterItem>) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal title={modalTitle} ref={modalRef}>
				<Form
					context={{disabled: isPreview, hideButton: isPreview}}
					onSubmit={submit}
					className="flex flex-col gap-2">
					<ModalChild control={control} />
				</Form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<TableFilter
					form={hookForm}
					data={data?.rows}
					pageCount={data?.totalPage}
					header={["Nomor", "Nama Item", "Kode Item", "Action"]}
					topComponent={
						<Button onClick={() => showModal("add", {})}>Add</Button>
					}
					renderItem={({item, Cell}, index) => {
						const {id, name, kode_item} = item;

						return (
							<>
								<Cell>{index + 1}</Cell>
								<Cell>{name}</Cell>
								<Cell>{kode_item}</Cell>
								<Cell className="flex gap-x-2">
									<Button onClick={() => showModal("preview", item)}>
										Preview
									</Button>
									<Button onClick={() => showModal("edit", item)}>Edit</Button>
									<Button onClick={() => showModal("delete", {id})}>
										Delete
									</Button>
								</Cell>
							</>
						);
					}}
				/>
			</div>
		</>
	);
}

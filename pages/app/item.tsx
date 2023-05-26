import {FormEventHandler, useRef} from "react";

import {useForm} from "react-hook-form";

import {ModalTypePreview} from "@appTypes/app.type";
import {TMasterItem} from "@appTypes/app.zod";
import {Button, Form, Modal, ModalRef, TableFilter} from "@components";
import {defaultErrorMutation} from "@constants";
import {getLayout} from "@hoc";
import {useTableFilter} from "@hooks";
import {
	FormType,
	ModalChildMasterItem,
} from "@pageComponent/item/ModalChildMasterItem";
import {modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

MasterItem.getLayout = getLayout;

export default function MasterItem() {
	const modalRef = useRef<ModalRef>(null);

	const {formValue, hookForm} = useTableFilter();
	const {mutate: mutateUpsert} =
		trpc.item.upsert.useMutation(defaultErrorMutation);
	const {mutate: mutateDelete} =
		trpc.item.delete.useMutation(defaultErrorMutation);
	const {data, refetch} = trpc.item.get.useQuery(formValue);

	const {control, handleSubmit, watch, clearErrors, reset} =
		useForm<FormType>();

	const [modalType] = watch(["type"]);
	const {modalTitle, isPreview} = modalTypeParser(modalType);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async ({type, id, ...body}) => {
			return console.log(body);
			switch (type) {
				case "add":
				case "edit":
					return mutateUpsert({...body, id}, {onSuccess});
				case "delete":
					return mutateDelete({id}, {onSuccess});
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
			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<Form
					context={{disabled: isPreview, hideButton: isPreview}}
					onSubmit={submit}
					className="flex flex-col gap-2">
					<ModalChildMasterItem reset={reset} control={control} />
				</Form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<TableFilter
					form={hookForm}
					data={data?.rows}
					pageCount={data?.totalPage}
					header={["Nomor", "Nama Mesin", "Nama Item", "Kode Item", "Action"]}
					topComponent={
						<Button onClick={() => showModal("add", {})}>Add</Button>
					}
					renderItem={({item, Cell}, index) => {
						const {id, name, kode_item} = item;

						return (
							<>
								<Cell>{index + 1}</Cell>
								<Cell>{item.nameMesins.join(", ")}</Cell>
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

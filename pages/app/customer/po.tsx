import {FormEventHandler, useRef} from "react";

import {useForm} from "react-hook-form";

import {ModalTypePreview} from "@appTypes/app.type";
import {Button, Form, Modal, ModalRef} from "@components";
import {getLayout} from "@hoc";
import {useTableFilterComponent} from "@hooks";
import PoModalChild, {FormType} from "@pageComponent/ModalChild_po";
import {dateUtils, modalTypeParser, nullRenderItem, nullUseQuery} from "@utils";
import {trpc} from "@utils/trpc";

POCustomer.getLayout = getLayout;
export default function POCustomer() {
	const modalRef = useRef<ModalRef>(null);

	const {control, reset, watch, clearErrors, handleSubmit} =
		useForm<FormType>();

	const dataForm = watch();
	const {type: modalType} = dataForm;

	const {modalTitle, isDelete, isPreview} = modalTypeParser(
		modalType,
		"Customer PO",
	);

	const {component, mutateOpts, refetch} = useTableFilterComponent({
		control,
		reset,
		property: "idPo",
		exportUseQuery: nullUseQuery,
		exportRenderItem: nullRenderItem,
		header: ["Nomor PO", "Customer", "Tanggal", "Due Date", "Status", "Action"],
		topComponent: <Button onClick={() => showModal("add", {})}>Add</Button>,
		useQuery: form => trpc.customer_po.getV2.useQuery(form),
		renderItem({item, Cell, CellSelect}) {
			const {
				id,
				tgl_po,
				status,
				due_date,
				nomor_po,
				OrmCustomer: customer,
			} = item;

			return (
				<>
					<CellSelect fieldName={`idPo.${id}`} />
					<Cell>{nomor_po}</Cell>
					<Cell>{customer?.name}</Cell>
					<Cell>{dateUtils.date(tgl_po)}</Cell>
					<Cell>{dateUtils.date(due_date)}</Cell>
					<Cell>{status}</Cell>
					<Cell className="flex gap-x-2">
						<Button onClick={() => showModal("preview", item)}>Preview</Button>
						<Button onClick={() => showModal("edit", item)}>Edit</Button>
						<Button onClick={() => showModal("delete", {id})}>Delete</Button>
					</Cell>
				</>
			);
		},
	});

	const insertPO = trpc.customer_po.add.useMutation(mutateOpts);
	const updatePO = trpc.customer_po.update.useMutation(mutateOpts);
	const deletePO = trpc.customer_po.delete.useMutation(mutateOpts);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, id, OrmCustomerPOItems: po_item = [], ...rest}) => {
			const onSuccess = () => {
				modalRef.current?.hide();
				refetch();
			};

			switch (type) {
				case "add":
					return insertPO.mutate({...rest, po_item}, {onSuccess});
				case "edit":
					return updatePO.mutate({id, po_item, ...rest}, {onSuccess});
				case "delete":
					return deletePO.mutate({id}, {onSuccess});
				default:
					return null;
			}
		})();
	};

	function showModal(type: ModalTypePreview, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal
				ref={modalRef}
				title={modalTitle}
				size={isDelete ? undefined : "xl"}>
				<Form
					onSubmit={submit}
					context={{hideButton: isPreview, disabled: isPreview}}>
					<PoModalChild reset={reset} control={control} />
				</Form>
			</Modal>
			<div className="overflow-x-auto w-full">{component}</div>
		</>
	);
}

import {FormEventHandler, useRef} from "react";

import {useForm} from "react-hook-form";

import {ModalTypePreview} from "@appTypes/app.type";
import {
	Button,
	Modal,
	ModalRef,
	TableFilterV2,
	TableFilterV2Ref,
	VRenderItem,
} from "@components";
import {getLayout} from "@hoc";
import {useLoader} from "@hooks";
import PoModalChild, {FormType} from "@pageComponent/ModalChild_po";
import {GetPageRows} from "@trpc/routers/customer_po";
import {dateUtils, modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

POCustomer.getLayout = getLayout;
export default function POCustomer() {
	const modalRef = useRef<ModalRef>(null);
	const tableRef = useRef<TableFilterV2Ref>(null);
	const {mutateOpts, ...loader} = useLoader();

	const insertPO = trpc.customer_po.add.useMutation(mutateOpts);
	const updatePO = trpc.customer_po.update.useMutation(mutateOpts);
	const deletePO = trpc.customer_po.delete.useMutation(mutateOpts);

	const {control, handleSubmit, watch, reset, clearErrors} = useForm<FormType>({
		// resolver: zodResolver(validationSchema),
	});

	const {refetch: refetchH} = trpc.customer_po.get.useQuery({
		type: "customer_po",
	});

	const dataForm = watch();
	const {type: modalType} = dataForm;
	const {isDelete, modalTitle} = modalTypeParser(modalType, "PO");

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, id, po_item = [], ...rest}) => {
			const onSuccess = () => {
				modalRef.current?.hide();
				refetchH();
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
			{loader.component}
			<Modal
				ref={modalRef}
				title={modalTitle}
				size={isDelete ? undefined : "xl"}>
				<form onSubmit={submit}>
					<PoModalChild reset={reset} control={control} />
				</form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<TableFilterV2
					ref={tableRef}
					keyExtractor={item => item.id}
					topComponent={
						<Button onClick={() => showModal("add", {})}>Add</Button>
					}
					useQuery={form =>
						trpc.customer_po.getPage.useQuery({
							type: "customer_po",
							...form,
						})
					}
					header={[
						"Nomor PO",
						"Customer",
						"Tanggal",
						"Due Date",
						"Status",
						"Action",
					]}
					renderItem={({item, Cell}: VRenderItem<GetPageRows>) => {
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
								<Cell>{nomor_po}</Cell>
								<Cell>{customer?.name}</Cell>
								<Cell>{dateUtils.date(tgl_po)}</Cell>
								<Cell>{dateUtils.date(due_date)}</Cell>
								<Cell>{status}</Cell>
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

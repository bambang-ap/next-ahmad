import {FormEventHandler, useRef} from "react";

import {useForm} from "react-hook-form";

import {ModalTypePreview} from "@appTypes/app.type";
import {Button, CellSelect, Modal, ModalRef, TableFilterV3} from "@components";
import {defaultErrorMutation} from "@constants";
import {getLayout} from "@hoc";
import {useLoader, useNewExportData, useTableFilter} from "@hooks";
import PoModalChild, {FormType} from "@pageComponent/ModalChild_po";
import {dateUtils, modalTypeParser, transformIds} from "@utils";
import {trpc} from "@utils/trpc";

POCustomer.getLayout = getLayout;
export default function POCustomer() {
	const loader = useLoader();
	const modalRef = useRef<ModalRef>(null);

	const insertPO = trpc.customer_po.add.useMutation(defaultErrorMutation);
	const updatePO = trpc.customer_po.update.useMutation(defaultErrorMutation);
	const deletePO = trpc.customer_po.delete.useMutation(defaultErrorMutation);
	const {hookForm, formValue} = useTableFilter();

	const {control, handleSubmit, watch, reset, clearErrors} = useForm<FormType>({
		// resolver: zodResolver(validationSchema),
	});

	const {refetch: refetchH} = trpc.customer_po.get.useQuery({
		type: "customer_po",
	});
	const {data, refetch} = trpc.customer_po.getPage.useQuery({
		type: "customer_po",
		...formValue,
	});

	const dataForm = watch();
	const {type: modalType} = dataForm;
	const {isSelect, isDelete, modalTitle} = modalTypeParser(
		modalType,
		"SPPB In",
	);

	const selectedIds = transformIds(dataForm.idPo);
	const {exportResult} = useNewExportData(
		() => {
			return trpc.export.po.useQuery(
				{idPo: selectedIds!},
				{
					enabled: selectedIds.length! > 0,
				},
			);
		},
		exportedData => exportedData,
	);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, id, po_item = [], ...rest}) => {
			const onSuccess = () => {
				modalRef.current?.hide();
				refetch();
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
				<TableFilterV3
					exportResult={exportResult}
					property="idPo"
					onCancel={() => reset(prev => ({...prev, type: undefined, idPo: {}}))}
					reset={reset}
					control={control}
					dataRender={data}
					keyExtractor={item => item.id}
					data={data}
					form={hookForm}
					header={[
						"Nomor PO",
						"Customer",
						"Tanggal",
						"Due Date",
						"Status",
						"Action",
					]}
					topComponent={
						<Button onClick={() => showModal("add", {})}>Add</Button>
					}
					renderItem={({item, Cell}) => {
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
								{isSelect && (
									<CellSelect
										noLabel
										control={control}
										fieldName={`idPo.${item.id}`}
									/>
								)}
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

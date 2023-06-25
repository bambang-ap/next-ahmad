import {FormEventHandler, useRef} from "react";

import {MutateOptions} from "@tanstack/react-query";
import {useForm} from "react-hook-form";

import ExportData from "@appComponent/ExportData";
import {ModalTypePreview, TCustomerSPPBOut} from "@appTypes/app.type";
import {Button, Form, Modal, ModalRef, TableFilter} from "@components";
import {defaultErrorMutation} from "@constants";
import {getLayout} from "@hoc";
import {useSppbOut, useTableFilter} from "@hooks";
import {SppbOutModalChild} from "@pageComponent/ModalChildSppbOut";
import {SPPBOutGenerateQR} from "@pageComponent/sppbOut_GenerateQR";
import {modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

SPPBOUT.getLayout = getLayout;

export type FormValue = {type: ModalTypePreview} & TCustomerSPPBOut;

export default function SPPBOUT() {
	const {dataKendaraan, dataCustomer} = useSppbOut();

	const modalRef = useRef<ModalRef>(null);

	const {formValue, hookForm} = useTableFilter();
	const {control, watch, reset, handleSubmit, clearErrors} =
		useForm<FormValue>();
	const {mutate: mutateUpsert} = trpc.sppb.out.upsert.useMutation();
	const {mutate: mutateDelete} = trpc.sppb.out.delete.useMutation();
	const {data, refetch} = trpc.sppb.out.get.useQuery(formValue);

	const [modalType] = watch(["type"]);
	const {modalTitle, isPreview} = modalTypeParser(modalType);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, ...values}) => {
			const callbackOpt: MutateOptions<any, any, any> = {
				...defaultErrorMutation,
				onSuccess() {
					refetch();
					modalRef.current?.hide();
				},
			};

			if (type === "delete") mutateDelete({id: values.id}, callbackOpt);
			else mutateUpsert(values, callbackOpt);
		})();
	};
	function showModal({type, ...rest}: Partial<FormValue>) {
		reset({...rest, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{disabled: isPreview, hideButton: isPreview}}
					className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
					<SppbOutModalChild reset={reset} control={control} />
				</Form>
			</Modal>

			<TableFilter
				data={data}
				form={hookForm}
				header={["Nomor Surat", "Kendaraan", "Customer", "Action"]}
				topComponent={
					<>
						<Button
							onClick={() =>
								showModal({
									type: "add",
									po: [{id_po: "", sppb_in: [{id_sppb_in: "", items: {}}]}],
								})
							}>
							Add
						</Button>
						<ExportData
							names={["SPPB Out"]}
							useQuery={() =>
								trpc.sppb.out.get.useQuery({limit: 9999, page: 1})
							}
							dataMapper={(dataSppbOut: TCustomerSPPBOut[]) => {
								if (!dataSppbOut) return [];
								return dataSppbOut?.map(({po, ...rest}) => rest);
							}}
						/>
					</>
				}
				renderItem={({Cell, item}) => {
					const {id, id_kendaraan, id_customer} = item;
					const kendaraan = dataKendaraan.find(e => e.id === id_kendaraan);
					const customer = dataCustomer.find(e => e.id === id_customer);
					return (
						<>
							<Cell>{item.invoice_no}</Cell>
							<Cell>{kendaraan?.name}</Cell>
							<Cell>{customer?.name}</Cell>

							<Cell className="flex gap-2">
								<SPPBOutGenerateQR {...item} />
								<Button
									icon="faMagnifyingGlass"
									onClick={() => showModal({...item, type: "preview"})}
								/>
								<Button
									onClick={() => showModal({...item, type: "edit"})}
									icon="faEdit"
								/>
								<Button
									onClick={() => showModal({id, type: "delete"})}
									icon="faTrash"
								/>
							</Cell>
						</>
					);
				}}
			/>
		</>
	);
}

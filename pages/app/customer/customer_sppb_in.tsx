import {FormEventHandler, useRef} from "react";

import {useForm} from "react-hook-form";

import ExportData from "@appComponent/ExportData";
import {ModalTypePreview, TCustomer, TUpsertSppbIn} from "@appTypes/app.type";
import {Button, Modal, ModalRef, TableFilter} from "@components";
import {defaultErrorMutation} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {getLayout} from "@hoc";
import {useTableFilter} from "@hooks";
import {SppbInModalChild} from "@pageComponent/ModalChild_customer_sppb_in";
import {dateUtils} from "@utils";
import {trpc} from "@utils/trpc";

export type FormType = {
	type: ModalTypePreview;
	id_customer?: string;
} & TUpsertSppbIn;

SPPBIN.getLayout = getLayout;

export default function SPPBIN() {
	const modalRef = useRef<ModalRef>(null);
	const {control, handleSubmit, watch, reset, clearErrors} = useForm<FormType>({
		defaultValues: {type: "add"},
	});

	const {formValue, hookForm} = useTableFilter();

	const {data, refetch} = trpc.sppb.in.getPage.useQuery({
		type: "sppb_in",
		...formValue,
	});
	const {data: dataCustomer} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {mutate: mutateUpsert} =
		trpc.sppb.in.upsert.useMutation(defaultErrorMutation);
	const {mutate: mutateDelete} =
		trpc.sppb.in.delete.useMutation(defaultErrorMutation);

	const modalType = watch("type");
	const modalTitle =
		modalType === "add"
			? `add SPPB In`
			: modalType === "edit"
			? `edit SPPB In`
			: modalType === "preview"
			? `preview SPPB In`
			: `delete SPPB In`;

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, po_item, ...rest}) => {
			if (type === "delete") return mutateDelete({id: rest.id}, {onSuccess});

			mutateUpsert({...rest, po_item: po_item.filter(Boolean)}, {onSuccess});
		})();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<TUpsertSppbIn>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<TableFilter
				data={data}
				form={hookForm}
				topComponent={
					<>
						<Button onClick={() => showModal("add", {})}>Add</Button>
						<ExportData
							names={["SPPB In"]}
							useQuery={() => trpc.sppb.in.get.useQuery({type: "sppb_in"})}
							dataMapper={dataSppbIn => {
								if (!dataSppbIn) return [];
								return dataSppbIn?.map(({detailPo, items, ...rest}) => rest);
							}}
						/>
					</>
				}
				header={[
					"Tanggal Surat Jalan",
					"Nomor PO",
					"Customer",
					"Nomor Surat Jalan",
					"Nomor Lot",
					"Action",
				]}
				renderItem={({Cell, item}) => {
					const {id} = item;
					return (
						<>
							<Cell>{dateUtils.date(item.tgl)}</Cell>
							<Cell>{item.detailPo?.nomor_po}</Cell>
							<Cell>
								{
									dataCustomer?.find(e => e.id === item.detailPo?.id_customer)
										?.name
								}
							</Cell>
							<Cell>{item.nomor_surat}</Cell>
							<Cell>{item.lot_no}</Cell>
							<Cell className="flex gap-2">
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

			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<SppbInModalChild reset={reset} control={control} />
				</form>
			</Modal>
		</>
	);
}

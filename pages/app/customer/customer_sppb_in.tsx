import {FormEventHandler, useRef} from "react";

import {useForm} from "react-hook-form";

import {
	ModalTypePreview,
	ModalTypeSelect,
	TCustomer,
	TUpsertSppbIn,
} from "@appTypes/app.type";
import {
	Button,
	CellSelect,
	Form,
	Modal,
	ModalRef,
	TableFilterV2Ref,
	TableFilterV3,
	VRenderItem,
} from "@components";
import {CRUD_ENABLED} from "@enum";
import {getLayout} from "@hoc";
import {useLoader, useNewExportData} from "@hooks";
import {SppbInModalChild} from "@pageComponent/ModalChild_customer_sppb_in";
import {SppbInRows} from "@trpc/routers/sppb/in";
import {dateUtils, modalTypeParser, transformIds} from "@utils";
import {trpc} from "@utils/trpc";

export type FormType = {
	type: ModalTypeSelect;
	id_customer?: string;
	idSppbIns?: MyObject<boolean>;
} & TUpsertSppbIn &
	Partial<Pick<SppbInRows, "items">>;

SPPBIN.getLayout = getLayout;

export default function SPPBIN() {
	const modalRef = useRef<ModalRef>(null);
	const tableRef = useRef<TableFilterV2Ref>(null);
	const {mutateOpts, ...loader} = useLoader();

	const {control, handleSubmit, watch, reset, clearErrors} = useForm<FormType>({
		defaultValues: {type: "add"},
	});

	const {data: dataCustomer} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {mutate: mutateUpsert} = trpc.sppb.in.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} = trpc.sppb.in.delete.useMutation(mutateOpts);

	const dataForm = watch();
	const {type: modalType} = dataForm;

	const {isPreview, modalTitle, isSelect} = modalTypeParser(
		modalType,
		"SPPB In",
	);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, po_item = [], ...rest}) => {
			if (type === "delete") return mutateDelete({id: rest.id}, {onSuccess});

			mutateUpsert({...rest, po_item: po_item.filter(Boolean)}, {onSuccess});
		})();

		function onSuccess() {
			modalRef.current?.hide();
			tableRef.current?.refetch();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<TUpsertSppbIn>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	const selectedIds = transformIds(dataForm.idSppbIns);
	const {exportResult} = useNewExportData(
		() => {
			return trpc.export.sppb.in.useQuery(
				{ids: selectedIds!},
				{
					enabled: selectedIds.length! > 0,
				},
			);
		},
		exportedData => exportedData,
	);

	return (
		<>
			{loader.component}
			<TableFilterV3
				control={control}
				reset={reset}
				property="idSppbIns"
				useQuery={form =>
					trpc.sppb.in.getPage.useQuery({
						type: "sppb_in",
						...form,
					})
				}
				exportResult={exportResult}
				keyExtractor={item => item?.id}
				topComponent={<Button onClick={() => showModal("add", {})}>Add</Button>}
				header={[
					"Tanggal Surat Jalan",
					"Nomor PO",
					"Customer",
					"Nomor Surat Jalan",
					!isSelect && "Action",
				]}
				renderItem={({Cell, item}: VRenderItem<SppbInRows>) => {
					const {id} = item;
					return (
						<>
							{isSelect && (
								<CellSelect
									noLabel
									control={control}
									fieldName={`idSppbIns.${item.id}`}
								/>
							)}
							<Cell>{dateUtils.date(item.tgl)}</Cell>
							<Cell>{item.detailPo?.nomor_po}</Cell>
							<Cell>
								{
									dataCustomer?.find(e => e.id === item.detailPo?.id_customer)
										?.name
								}
							</Cell>
							<Cell>{item.nomor_surat}</Cell>
							{!isSelect && (
								<Cell className="flex gap-2">
									<Button onClick={() => showModal("preview", item)}>
										Preview
									</Button>
									<Button onClick={() => showModal("edit", item)}>Edit</Button>
									<Button onClick={() => showModal("delete", {id})}>
										Delete
									</Button>
								</Cell>
							)}
						</>
					);
				}}
			/>

			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<Form
					context={{disabled: isPreview, hideButton: isPreview}}
					onSubmit={submit}>
					<SppbInModalChild reset={reset} control={control} />
				</Form>
			</Modal>
		</>
	);
}

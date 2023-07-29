import {FormEventHandler, useRef} from "react";

import {useForm} from "react-hook-form";

import {SelectAllButton} from "@appComponent/GeneratePdf";
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
	TableFilter,
} from "@components";
import {defaultErrorMutation} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {getLayout} from "@hoc";
import {useExportData, useTableFilter} from "@hooks";
import {SppbInModalChild} from "@pageComponent/ModalChild_customer_sppb_in";
import {SppbInRows} from "@trpc/routers/sppb/in";
import {dateUtils, modalTypeParser, sleep} from "@utils";
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

	const dataForm = watch();
	const {type: modalType, idSppbIns} = dataForm;

	const {isPreview, modalTitle, isSelect} = modalTypeParser(
		modalType,
		"SPPB In",
	);

	const selectedIdSppbIns = Object.entries(idSppbIns ?? {}).reduce<string[]>(
		(ret, [id, val]) => {
			if (val) ret.push(id);
			return ret;
		},
		[],
	);

	const {exportResult} = useExportData(
		() =>
			trpc.useQueries(t =>
				selectedIdSppbIns.map(id =>
					t.sppb.in.get({type: "sppb_in", where: {id}}),
				),
			),
		({data}) => {
			const {detailPo, items, ...rest} = data?.[0] ?? {};

			return rest;
		},
	);

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

	async function exportData() {
		if (selectedIdSppbIns.length <= 0) {
			return alert("Silahkan pilih data terlebih dahulu");
		}

		exportResult();
		reset(prev => ({...prev, type: undefined}));
		await sleep(2500);
		reset(prev => ({...prev, idSppbIns: {}}));
	}

	return (
		<>
			<TableFilter
				data={data}
				form={hookForm}
				keyExtractor={item => item?.id}
				topComponent={
					isSelect ? (
						<>
							<Button onClick={() => exportData()}>Export</Button>
							<Button
								onClick={() =>
									reset(prev => ({...prev, type: undefined, idKanbans: {}}))
								}>
								Batal
							</Button>
						</>
					) : (
						<>
							<Button
								onClick={() => reset(prev => ({...prev, type: "select"}))}>
								Select
							</Button>
							<Button onClick={() => showModal("add", {})}>Add</Button>
						</>
					)
				}
				header={[
					isSelect && (
						<SelectAllButton
							form={dataForm}
							property="idSppbIns"
							key="btnSelectAll"
							// @ts-ignore
							data={data?.rows}
							onClick={prev => reset(prev)}
							selected={selectedIdSppbIns.length}
							total={data?.rows.length}
						/>
					),
					"Tanggal Surat Jalan",
					"Nomor PO",
					"Customer",
					"Nomor Surat Jalan",
					!isSelect && "Action",
				]}
				renderItem={({Cell, item}) => {
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

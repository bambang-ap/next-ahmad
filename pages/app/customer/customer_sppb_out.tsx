/* eslint-disable @typescript-eslint/no-unused-vars */
import {FormEventHandler, useRef} from "react";

import {MutateOptions} from "@tanstack/react-query";
import {useForm} from "react-hook-form";

import {GenPdfRef, SelectAllButton} from "@appComponent/GeneratePdf";
import {GeneratePdfV2} from "@appComponent/GeneratePdfV2";
import {ModalTypeSelect, TCustomerSPPBOutUpsert} from "@appTypes/app.type";
import {
	Button,
	CellSelect,
	Form,
	Modal,
	ModalRef,
	TableFilter,
	TableProps,
} from "@components";
import {getLayout} from "@hoc";
import {useLoader, useNewExportData, useSppbOut, useTableFilter} from "@hooks";
import {SppbOutModalChild} from "@pageComponent/ModalChildSppbOut";
import {SPPBOutGenerateQR} from "@pageComponent/sppbOut_GenerateQR";
import {modalTypeParser, sleep} from "@utils";
import {trpc} from "@utils/trpc";

SPPBOUT.getLayout = getLayout;

export type FormValue = {
	type: ModalTypeSelect;
	idSppbOuts?: MyObject<boolean>;
} & TCustomerSPPBOutUpsert;

export default function SPPBOUT() {
	const {dataKendaraan, dataCustomer} = useSppbOut();
	const {mutateOpts, ...loader} = useLoader();

	const modalRef = useRef<ModalRef>(null);
	const genPdfRef = useRef<GenPdfRef>(null);

	const {formValue, hookForm} = useTableFilter({limit: 5});
	const {control, watch, reset, handleSubmit, clearErrors} =
		useForm<FormValue>();
	const {mutate: mutateUpsert} = trpc.sppb.out.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} = trpc.sppb.out.delete.useMutation(mutateOpts);
	const {data, refetch} = trpc.sppb.out.get.useQuery(formValue);

	const dataForm = watch();

	const {type: modalType, idSppbOuts: idSppbIns} = dataForm;

	const {isPreview, modalTitle, isAdd, isEdit, isSelect} = modalTypeParser(
		modalType,
		"SPPB Out",
	);

	const widthSize = 1100;
	const selectedIdSppbIns = Object.entries(idSppbIns ?? {}).reduce<string[]>(
		(ret, [id, val]) => {
			if (val) ret.push(id);
			return ret;
		},
		[],
	);

	const tableHeader: TableProps["header"] = [
		isSelect && (
			<SelectAllButton
				form={dataForm}
				property="idSppbOuts"
				key="btnSelectAll"
				data={data?.rows}
				onClick={prev => reset(prev)}
				selected={selectedIdSppbIns.length}
				total={data?.rows.length}
			/>
		),
		"Nomor Surat",
		"Kendaraan",
		"Customer",
		"Keterangan",
		!isSelect && "Action",
	];

	const {exportResult} = useNewExportData(
		() =>
			trpc.export.sppb.out.useQuery(
				{id: selectedIdSppbIns},
				{enabled: selectedIdSppbIns.length > 0},
			),
		exportedData => exportedData,
	);

	const topComponent = isSelect ? (
		<>
			<Button onClick={() => printData(true)}>Print</Button>
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
			<Button onClick={() => reset(prev => ({...prev, type: "select"}))}>
				Select
			</Button>
			<Button onClick={() => showModal({type: "add"})}>Add</Button>
		</>
	);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, ...values}) => {
			const callbackOpt: MutateOptions<any, any, any> = {
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

	async function exportData() {
		if (selectedIdSppbIns.length <= 0) {
			return alert("Silahkan pilih data terlebih dahulu");
		}

		exportResult();
		reset(prev => ({...prev, type: undefined}));
		await sleep(2500);
		reset(prev => ({...prev, idSppbIns: {}}));
	}

	async function printData(
		idOrAll: true | string,
		sppbOutIds = selectedIdSppbIns,
	): Promise<any> {
		loader?.show?.();
		if (typeof idOrAll === "string") {
			reset(prev => ({...prev, idSppbOuts: {[idOrAll]: true}}));
			return printData(true, [idOrAll]);
		} else {
			if (sppbOutIds.length <= 0) {
				loader?.hide?.();
				return alert("Silahkan pilih data terlebih dahulu");
			}
		}

		await genPdfRef.current?.generate();
		refetch();
		loader?.hide?.();
		reset(prev => ({...prev, type: undefined}));
	}

	return (
		<>
			{loader.component}
			<GeneratePdfV2
				// TODO: multiple print sppb out orientation error
				width={`w-[${widthSize}px]`}
				ref={genPdfRef}
				tagId="kanban-data-print"
				splitPagePer={1}
				useQuery={() => trpc.print.sppb.out.useQuery({id: selectedIdSppbIns})}
				renderItem={pdfData => {
					return (
						<>
							<SPPBOutGenerateQR detail={pdfData} width={widthSize} />
						</>
					);
				}}
			/>

			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{disabled: isPreview, hideButton: isPreview}}
					className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
					<SppbOutModalChild reset={reset} control={control} />

					{(isAdd || isEdit) && <Button type="submit">Submit</Button>}
				</Form>
			</Modal>

			<TableFilter
				data={data}
				form={hookForm}
				header={tableHeader}
				keyExtractor={item => item.id}
				topComponent={topComponent}
				renderItem={({Cell, item}) => {
					const {id, id_kendaraan, id_customer} = item;
					const kendaraan = dataKendaraan.find(e => e.id === id_kendaraan);
					const customer = dataCustomer.find(e => e.id === id_customer);
					return (
						<>
							{isSelect && (
								<CellSelect
									noLabel
									control={control}
									fieldName={`idSppbOuts.${id}`}
								/>
							)}
							<Cell>{item.invoice_no}</Cell>
							<Cell>{kendaraan?.name}</Cell>
							<Cell>{customer?.name}</Cell>
							<Cell>{item.keterangan}</Cell>

							{!isSelect && (
								<Cell className="flex gap-2">
									<Button icon="faPrint" onClick={() => printData(id)} />
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
							)}
						</>
					);
				}}
			/>
		</>
	);
}

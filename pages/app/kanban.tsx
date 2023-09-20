/* eslint-disable @typescript-eslint/no-unused-vars */

import {FormEventHandler, useEffect, useRef} from "react";

import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import {GenPdfRef, SelectAllButton} from "@appComponent/GeneratePdf";
import {GeneratePdfV2} from "@appComponent/GeneratePdfV2";
import {
	ModalTypePreview,
	ModalTypeSelect,
	TKanban,
	TKanbanUpsert,
} from "@appTypes/app.zod";
import {
	Button,
	CellSelect,
	Form,
	Modal,
	ModalRef,
	TableFilter,
} from "@components";
import {cuttingLineClassName, nonRequiredRefetch} from "@constants";
import {getLayout} from "@hoc";
import {useLoader, useNewExportData, useTableFilter} from "@hooks";
import {RenderKanbanCardV2} from "@pageComponent/KanbanCardV2";
import {NewKanbanModalChild} from "@pageComponent/kanban_ModalChild/index-new";
import {atomDataKanban} from "@recoil/atoms";
import {classNames, dateUtils, modalTypeParser, sleep} from "@utils";
import {trpc} from "@utils/trpc";

Kanban.getLayout = getLayout;

export type KanbanFormType = TKanbanUpsert & {
	type: ModalTypeSelect;
	idKanbans?: MyObject<boolean>;
	id_customer: string;
	temp_id_item: string;
	callbacks?: Array<() => void>;
};

export default function Kanban() {
	const modalRef = useRef<ModalRef>(null);
	const genPdfRef = useRef<GenPdfRef>(null);
	const setKanbanTableForm = useSetRecoilState(atomDataKanban);
	const {mutateOpts, ...loader} = useLoader();
	const {formValue, hookForm} = useTableFilter();
	const {control, watch, reset, clearErrors, handleSubmit} =
		useForm<KanbanFormType>();
	const {
		data: dataKanbanPage,
		refetch,
		isFetched,
	} = trpc.kanban.getPage.useQuery(formValue!, {enabled: !!formValue});

	const {mutate: mutateUpsert} = trpc.kanban.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} = trpc.kanban.delete.useMutation(mutateOpts);
	const {mutateAsync: mutatePrint} =
		trpc.kanban.printed.useMutation(mutateOpts);

	const dataForm = watch();

	const {type: modalType, idKanbans = {}} = dataForm;
	const {isPreview, isSelect, modalTitle} = modalTypeParser(
		modalType,
		"Kanban",
	);

	const selectedIdKanbans = Object.entries(idKanbans).reduce<string[]>(
		(ret, [id, val]) => {
			if (val) ret.push(id);
			return ret;
		},
		[],
	);

	const useEffectDeps = [dataKanbanPage].map(e => {
		if (!e) return "";
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {rows, ...rest} = e;
		return JSON.stringify(rest);
	});

	const {exportResult} = useNewExportData(
		() =>
			trpc.export.kanban.useQuery(
				{idKanbans: selectedIdKanbans},
				{enabled: selectedIdKanbans.length > 0},
			),
		data => data,
	);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(
			async ({nomor_kanban, type, callbacks, list_mesin = {}, ...rest}) => {
				if (callbacks) callbacks.forEach(callback => callback());

				switch (type) {
					case "add":
					case "edit":
						return mutateUpsert({...rest, list_mesin}, {onSuccess});
					case "delete":
						return mutateDelete({id: rest.id}, {onSuccess});
					default:
						return null;
				}
			},
		)();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<Omit<KanbanFormType, "type">>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	async function exportData() {
		if (selectedIdKanbans.length <= 0) {
			return alert("Silahkan pilih data terlebih dahulu");
		}

		exportResult();
		reset(prev => ({...prev, type: undefined}));
		await sleep(2500);
		reset(prev => ({...prev, idKanbans: {}}));
	}

	async function printData(
		idOrAll: true | string,
		kanbanIds = selectedIdKanbans,
	): Promise<any> {
		loader?.show?.();
		if (typeof idOrAll === "string") {
			reset(prev => ({...prev, idKanbans: {[idOrAll]: true}}));
			await sleep(500);
			return printData(true, [idOrAll]);
		} else {
			if (kanbanIds.length <= 0) {
				loader?.hide?.();
				return alert("Silahkan pilih data terlebih dahulu");
			}
		}

		await genPdfRef.current?.generate();
		await mutatePrint(kanbanIds);
		refetch();
		loader?.hide?.();
		reset(prev => ({...prev, type: undefined}));
		await sleep(2500);
		reset(prev => ({...prev, idKanbans: {}}));
	}

	useEffect(() => {
		// FIXME:
		// @ts-ignore
		if (!!dataKanbanPage) setKanbanTableForm(dataKanbanPage?.rows);
	}, useEffectDeps);

	return (
		<>
			{loader.component}
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{disabled: isPreview, hideButton: isPreview}}>
					<NewKanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>

			<GeneratePdfV2
				width="w-[1850px]"
				splitPagePer={4}
				orientation="l"
				ref={genPdfRef}
				tagId="kanban-data-print"
				useQuery={() =>
					trpc.print.kanban.useQuery(
						{id: selectedIdKanbans},
						{enabled: selectedIdKanbans.length > 0},
					)
				}
				renderItem={data => {
					return (
						<div
							key={data.id}
							className={classNames("w-1/2 p-6", cuttingLineClassName)}>
							<RenderKanbanCardV2 {...data} />
						</div>
					);
				}}
			/>
			<TableFilter
				form={hookForm}
				data={dataKanbanPage}
				isLoading={!isFetched}
				keyExtractor={item => item.id}
				header={[
					isSelect && (
						<SelectAllButton
							form={dataForm}
							property="idKanbans"
							key="btnSelectAll"
							data={dataKanbanPage?.rows}
							onClick={prev => reset(prev)}
							selected={selectedIdKanbans.length}
							total={dataKanbanPage?.rows.length}
						/>
					),
					"Tanggal",
					"Nomor PO",
					"Nomor Kanban",
					"Nomor Surat",
					"Customer",
					"Mesin",
					"Keterangan",
					"Di cetak",
					!isSelect && "Action",
				]}
				topComponent={
					isSelect ? (
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
							<Button
								onClick={() => reset(prev => ({...prev, type: "select"}))}>
								Select
							</Button>
							<Button onClick={() => showModal("add", {})}>Add</Button>
						</>
					)
				}
				renderItem={({Cell, item}) => {
					return (
						<>
							{isSelect && (
								<CellSelect
									noLabel
									control={control}
									fieldName={`idKanbans.${item.id}`}
								/>
							)}
							<Cell>{dateUtils.date(item.createdAt)}</Cell>
							<Cell>{item.OrmCustomerPO.nomor_po}</Cell>
							<Cell>{item.nomor_kanban}</Cell>
							<Cell>{item?.OrmCustomerSPPBIn?.nomor_surat}</Cell>
							<Cell>{item.OrmCustomerPO?.OrmCustomer?.name}</Cell>
							<Cell>
								<RenderNameMesin list_mesin={item.list_mesin} />
							</Cell>
							<Cell>{item.keterangan}</Cell>
							<Cell className="flex justify-center">{item.printed}</Cell>
							{!isSelect && (
								<Cell className="flex gap-x-2">
									<Button icon="faPrint" onClick={() => printData(item.id)} />
									<Button
										icon="faMagnifyingGlass"
										onClick={() => showModal("preview", item)}
									/>
									<Button
										onClick={() => showModal("edit", item)}
										icon="faEdit"
									/>
									<Button
										onClick={() => showModal("delete", {id: item.id})}
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

function RenderNameMesin({list_mesin}: Pick<TKanban, "list_mesin">) {
	const {data} = trpc.kanban.nameMesin.useQuery(
		{list_mesin},
		nonRequiredRefetch,
	);

	return <>{data?.map(e => e.dataKMesin.name).join(" | ")}</>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */

import {FormEventHandler, useEffect, useRef} from "react";

import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import {
	GeneratePdf,
	GenPdfRef,
	SelectAllButton,
} from "@appComponent/GeneratePdf";
import {
	ModalTypePreview,
	ModalTypeSelect,
	TKanbanUpsert,
} from "@appTypes/app.zod";
import {
	Button,
	CellSelect,
	Form,
	Icon,
	Modal,
	ModalRef,
	TableFilter,
} from "@components";
import {cuttingLineClassName, defaultErrorMutation} from "@constants";
import {getLayout} from "@hoc";
import {useExportData, useLoader, useTableFilter} from "@hooks";
import {RenderKanbanCard} from "@pageComponent/KanbanCard";
import {KanbanModalChild} from "@pageComponent/kanban_ModalChild";
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
	const loader = useLoader();

	const {formValue, hookForm} = useTableFilter({limit: 5});
	const {control, watch, reset, clearErrors, handleSubmit} =
		useForm<KanbanFormType>();
	const {data: dataKanbanPage, refetch} = trpc.kanban.getPage.useQuery(
		formValue!,
		{enabled: !!formValue},
	);

	const {mutate: mutateUpsert} =
		trpc.kanban.upsert.useMutation(defaultErrorMutation);
	const {mutate: mutateDelete} =
		trpc.kanban.delete.useMutation(defaultErrorMutation);
	const {mutateAsync: mutatePrinted} =
		trpc.kanban.printed.useMutation(defaultErrorMutation);

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

	const {exportResult} = useExportData(
		() =>
			trpc.useQueries(t => selectedIdKanbans.map(id => t.kanban.detail(id))),
		({data}) => {
			const {
				items,
				list_mesin,
				OrmDocument,
				OrmCustomerPO,
				dataSppbIn,
				dataCreatedBy,
				image,
				dataScan,
				dataUpdatedBy,
				createdBy,
				...rest
			} = data ?? {};

			return rest;
		},
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

	async function printData(idOrAll: true | string): Promise<any> {
		loader?.show?.();
		if (typeof idOrAll === "string") {
			reset(prev => ({...prev, idKanbans: {[idOrAll]: true}}));
			return printData(true);
		} else {
			if (selectedIdKanbans.length <= 0) {
				loader?.hide?.();
				return alert("Silahkan pilih data terlebih dahulu");
			}
		}
		await genPdfRef.current?.generate();
		await mutatePrinted(selectedIdKanbans);
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
			<GeneratePdf
				width="w-[1850px]"
				splitPagePer={4}
				orientation="l"
				ref={genPdfRef}
				tagId="kanban-data-print"
				useQueries={() =>
					trpc.useQueries(t => selectedIdKanbans.map(id => t.kanban.detail(id)))
				}
				renderItem={({data}) => {
					const {items = {}, id} = data ?? {};

					return (
						<>
							{Object.entries(items).map(item => {
								return (
									<div
										key={item[0]}
										className={classNames("w-1/2 p-6", cuttingLineClassName)}>
										<RenderKanbanCard idKanban={id!} item={item} />
									</div>
								);
							})}
						</>
					);
				}}
			/>
			<TableFilter
				form={hookForm}
				data={dataKanbanPage}
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
					"Nomor Kanban",
					"Customer",
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
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {...rest} = item;
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
							<Cell>{item.nomor_kanban}</Cell>
							<Cell>{item.OrmCustomerPO.OrmCustomer.name}</Cell>
							<Cell>{item.keterangan}</Cell>
							<Cell className="flex justify-center">
								<Icon
									className="text-xl"
									name={item.printed ? "faCheckCircle" : "faXmarkCircle"}
								/>
							</Cell>
							{!isSelect && (
								<Cell className="flex gap-x-2">
									<Button icon="faPrint" onClick={() => printData(item.id)} />
									<Button
										icon="faMagnifyingGlass"
										onClick={() => showModal("preview", rest)}
									/>
									<Button
										onClick={() => showModal("edit", rest)}
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

			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{disabled: isPreview, hideButton: isPreview}}>
					<KanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>
		</>
	);
}

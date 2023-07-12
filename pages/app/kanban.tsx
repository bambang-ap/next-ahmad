/* eslint-disable @typescript-eslint/no-unused-vars */

import {FormEventHandler, useEffect, useRef} from "react";

import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import ExportData from "@appComponent/ExportData";
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
import {Button, Form, Input, Modal, ModalRef, TableFilter} from "@components";
import {defaultErrorMutation} from "@constants";
import {getLayout} from "@hoc";
import {useLoader, useTableFilter} from "@hooks";
import {RenderKanbanCard} from "@pageComponent/KanbanCard";
import {KanbanModalChild} from "@pageComponent/kanban_ModalChild";
import {atomDataKanban} from "@recoil/atoms";
import {dateUtils, modalTypeParser} from "@utils";
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

	const [modalType, idKanbans = {}] = watch(["type", "idKanbans"]);
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

	const tagId = `kanban-data-print`;

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

	function selectAll() {
		reset(prev => {
			const isSelectedAll =
				selectedIdKanbans.length === (dataKanbanPage?.rows.length ?? 0);
			return {
				...prev,
				idKanbans: isSelectedAll
					? {}
					: dataKanbanPage?.rows.reduce<KanbanFormType["idKanbans"]>(
							(ret, cur) => {
								return {...ret, [cur.id]: true};
							},
							{},
					  ),
			};
		});
	}

	async function printData(idOrAll: true | string) {
		loader?.show?.();
		if (typeof idOrAll === "string") {
			reset(prev => ({...prev, idKanbans: {[idOrAll]: true}}));
		} else {
			if (selectedIdKanbans.length <= 0) {
				loader?.hide?.();
				return alert("Silahkan pilih data terlebih dahulu");
			}
		}
		await genPdfRef.current?.generate();
		loader?.hide?.();
		reset(prev => ({...prev, type: undefined}));
		setTimeout(() => reset(prev => ({...prev, idKanbans: {}})), 2500);
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
				splitPagePer={4}
				orientation="l"
				ref={genPdfRef}
				tagId={tagId}
				useQueries={() =>
					trpc.useQueries(t => selectedIdKanbans.map(id => t.kanban.detail(id)))
				}
				renderItem={({data}) => {
					const {items = {}, id} = data ?? {};

					return (
						<>
							{Object.entries(items).map(item => {
								return (
									<div key={item[0]} className="w-1/2 p-2">
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
							key="btnSelectAll"
							onClick={selectAll}
							selected={selectedIdKanbans.length}
							total={dataKanbanPage?.rows.length}
						/>
					),
					"Tanggal",
					"Nomor Kanban",
					"Customer",
					"Keterangan",
					!isSelect && "Action",
				]}
				topComponent={
					isSelect ? (
						<>
							<Button onClick={() => printData(true)}>Print</Button>
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
								Batch Print
							</Button>
							<Button onClick={() => showModal("add", {})}>Add</Button>
							<ExportData
								names={["Kanban"]}
								useQuery={() => trpc.kanban.get.useQuery({type: "kanban"})}
								dataMapper={dataKanban => {
									if (!dataKanban) return [];
									return dataKanban?.map(
										({
											items,
											list_mesin,
											OrmDocument,
											OrmCustomerPO,
											dataSppbIn,
											dataCreatedBy,
											image,
											dataUpdatedBy,
											createdBy,
											...rest
										}) => rest,
									);
								}}
							/>
						</>
					)
				}
				renderItem={({Cell, item}) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {...rest} = item;
					return (
						<>
							{isSelect && (
								<Cell>
									{
										<Input
											noLabel
											type="checkbox"
											control={control}
											fieldName={`idKanbans.${item.id}`}
										/>
									}
								</Cell>
							)}
							<Cell>{dateUtils.date(item.createdAt)}</Cell>
							<Cell>{item.nomor_kanban}</Cell>
							<Cell>{item.OrmCustomerPO.OrmCustomer.name}</Cell>
							<Cell>{item.keterangan}</Cell>
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

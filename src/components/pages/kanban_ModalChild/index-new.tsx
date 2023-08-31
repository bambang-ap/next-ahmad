import {useEffect} from "react";

import type {ScanListFormType} from "pages/app/scan/[route]/list";
import {useWatch} from "react-hook-form";

import {FormProps} from "@appTypes/app.type";
import {
	Button,
	ImageFormWithPreview,
	Input,
	InputFile,
	Select,
	selectMapper,
} from "@components";
import {CRUD_ENABLED} from "@enum";
import {modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

import {RenderItem} from "./RenderItem";

export function NewKanbanModalChild({
	control,
	reset,
}: FormProps<ScanListFormType, "control" | "reset">) {
	const {
		id: idKanban,
		id_customer: idCustomer,
		id_sppb_in: idSppbIn,
		temp_id_item: tempIdItem,
		items: kanbanItems = {},
		id_po,
		type: modalType,
	} = useWatch({control});

	const {data: dataPo = [], isLoading: isLoadingPo} =
		trpc.kanban.po.get.useQuery({id: idCustomer!}, {enabled: !!idCustomer});

	const {data: dataCustomer, isLoading: isLoadingCustomer} =
		trpc.basic.get.useQuery({
			target: CRUD_ENABLED.CUSTOMER,
		});
	const {data: nomorKanban} = trpc.kanban.getInvoice.useQuery();
	const {data: detailKanban} = trpc.kanban.detail.useQuery(idKanban!, {
		enabled: !!idKanban,
		onSuccess(r) {
			reset(prev => ({...prev, ...r}));
		},
	});

	const {isPreview, isDelete} = modalTypeParser(modalType);

	const selectedPo = dataPo.find(e => e.id === id_po);
	const selectedSppbIn = selectedPo?.OrmCustomerSPPBIns?.find(
		e => e.id === idSppbIn,
	);
	const itemsInSppbIn = selectedSppbIn?.OrmPOItemSppbIns?.filter(
		e => !Object.keys(kanbanItems).includes(e.id),
	);

	useEffect(() => {
		if (tempIdItem) {
			reset(({items, id_sppb_in, list_mesin, ...prevValue}) => {
				return {
					...prevValue,
					temp_id_item: "",
					id_sppb_in,
					items: {...items, [tempIdItem]: {id_sppb_in}} as typeof items,
					list_mesin: {
						...list_mesin,
						[tempIdItem]: [null],
					} as typeof list_mesin,
				};
			});
		}
	}, [tempIdItem]);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<div key={detailKanban?.id} className="flex flex-col gap-2 max-h-[600px]">
			<div className="flex gap-2">
				<Input
					className="flex-1"
					control={control}
					fieldName="keterangan"
					label="Keterangan"
				/>
				<Input
					disabled
					className="flex-1"
					control={control}
					key={nomorKanban}
					defaultValue={nomorKanban}
					fieldName="nomor_kanban"
					label="Nomor Kanban"
				/>

				{isPreview ? (
					<ImageFormWithPreview
						className="w-20 max-h-20 overflow-hidden self-center"
						control={control}
						fieldName="image"
					/>
				) : (
					<InputFile
						label="Upload Image"
						accept="image/*"
						control={control}
						fieldName="image"
					/>
				)}
			</div>

			<div className="flex gap-2">
				<Select
					key={idCustomer}
					disabled={isPreview}
					className="flex-1"
					firstOption="- Pilih Customer -"
					control={control}
					isLoading={isLoadingCustomer}
					data={selectMapper(dataCustomer ?? [], "id", "name")}
					fieldName="id_customer"
					label="Customer"
				/>
				{idCustomer && (
					<Select
						className="flex-1"
						control={control}
						fieldName="id_po"
						firstOption="- Pilih PO -"
						label="PO"
						isLoading={isLoadingPo}
						data={selectMapper(
							dataPo?.filter(e => !e.isClosed),
							"id",
							"nomor_po",
						)}
					/>
				)}

				{id_po && (
					<Select
						className="flex-1"
						control={control}
						fieldName="id_sppb_in"
						label="Surat Jalan Masuk"
						firstOption="- Pilih Surat Jalan -"
						data={selectMapper(
							selectedPo?.OrmCustomerSPPBIns ?? [],
							"id",
							"nomor_surat",
						)}
					/>
				)}

				{!isPreview && idSppbIn && Object.keys(kanbanItems).length <= 0 && (
					<Select
						key={tempIdItem}
						className="flex-1"
						control={control}
						fieldName="temp_id_item"
						label="Tambah Item"
						firstOption="- Tambah Item -"
						data={selectMapper(itemsInSppbIn ?? [], "id", [
							"OrmMasterItem.name",
						])}
					/>
				)}
			</div>

			<div className="flex-1 overflow-y-auto flex flex-col gap-2">
				<RenderItem control={control} reset={reset} />
			</div>

			{!isPreview && <Button type="submit">Submit</Button>}
		</div>
	);
}

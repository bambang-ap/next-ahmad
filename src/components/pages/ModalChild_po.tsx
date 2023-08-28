import {useEffect} from "react";

import moment from "moment";
import {Control, useController, UseFormReset, useWatch} from "react-hook-form";

import {
	ModalTypePreview,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
} from "@appTypes/app.type";
import {
	Button,
	Input,
	Select,
	selectMapper,
	SelectPropsData,
	Table,
	TableProps,
} from "@components";
import {formatDate, selectUnitData} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {trpc} from "@utils/trpc";

export type UQtyList = `qty${typeof qtyList[number]}`;
export const qtyList = [1, 2, 3] as const;

export type FormType = TCustomerPO & {
	type: ModalTypePreview;
} & Pick<TCustomerPOExtended, "po_item">;

export default function PoModalChild({
	control,
	reset: resetForm,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const {type: modalType, po_item: poItem = [], tgl_po} = useWatch({control});

	const {data} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	const {data: dataMasterItem} = trpc.item.get.useQuery({
		limit: 10000,
	});

	const {
		field: {onChange: onChangePoItem},
	} = useController({control, name: "po_item"});

	const {headerTable, isPreview} = {
		get isPreview() {
			return modalType === "preview";
		},
		get headerTable() {
			const tableHeader: TableProps<any>["header"] = [
				"No",
				"Nama Item",
				"Kode Item",
				"Harga",
				...qtyList.map(num => `Jumlah ${num}`),
			];

			if (this.isPreview) return tableHeader;
			return [...tableHeader, "Action"];
		},
	};

	// const selectedMasterItemIds = poItem.map(e => e.master_item_id);

	const mappedData = (data ?? []).map<SelectPropsData>(({name, id}) => ({
		label: name,
		value: id,
	}));

	function removeItem(index: number) {
		onChangePoItem(poItem?.remove(index));
	}

	function addItem() {
		resetForm(({po_item = [], ...prev}) => {
			return {
				...prev,
				po_item: [...po_item, {} as typeof po_item[number]],
			};
		});
	}

	useEffect(() => {
		if (!!tgl_po) {
			resetForm(prev => {
				return {
					...prev,
					due_date: moment(tgl_po).add(3, "d").format(formatDate),
				};
			});
		}
	}, [tgl_po]);

	if (modalType === "delete") {
		return (
			<div>
				<label>Hapus ?</label>
				<Button type="submit">Ya</Button>
			</div>
		);
	}

	return (
		<div className="gap-y-2 flex flex-col">
			<div className="flex gap-2">
				<Select
					className="flex-1"
					disabled={isPreview}
					firstOption="- Pilih customer -"
					control={control}
					data={mappedData}
					label="Customer"
					fieldName="id_customer"
				/>
				<Input
					className="flex-1"
					disabled={isPreview}
					control={control}
					fieldName="nomor_po"
					label="PO"
				/>
				<Input
					className="flex-1"
					type="date"
					disabled={isPreview}
					control={control}
					label="Tanggal"
					fieldName="tgl_po"
				/>
				<Input
					disabled
					className="flex-1"
					type="date"
					label="Due Date"
					control={control}
					fieldName="due_date"
				/>
			</div>

			{poItem && poItem.length > 0 && (
				<Table
					data={poItem}
					reverseEachItem
					header={headerTable}
					className="overflow-y-auto"
					renderItem={({item, Cell}, index) => {
						const listItems = dataMasterItem?.rows ?? [];

						const selectedItem = dataMasterItem?.rows.find(
							e => e.id === item.master_item_id,
						);

						return (
							<>
								<Cell>{index + 1}</Cell>
								<Cell width="25%">
									<Select
										className="flex-1"
										label="Nama Item"
										control={control}
										data={selectMapper(listItems, "id", "name")}
										fieldName={`po_item.${index}.master_item_id`}
									/>
								</Cell>
								<Cell>{selectedItem?.kode_item}</Cell>
								<Cell>
									<Input
										className="flex-1"
										disabled={isPreview}
										control={control}
										type="decimal"
										fieldName={`po_item.${index}.harga`}
										label="Harga"
									/>
								</Cell>
								{qtyList.map(num => {
									return (
										<Cell key={num} className="gap-2">
											<Input
												className="flex-1"
												disabled={isPreview}
												control={control}
												type="decimal"
												fieldName={`po_item.${index}.qty${num}`}
												label="Qty"
											/>
											<Select
												disabled={isPreview}
												className="flex-1"
												firstOption="- Pilih unit -"
												control={control}
												fieldName={`po_item.${index}.unit${num}`}
												data={selectUnitData}
												label="Unit"
											/>
										</Cell>
									);
								})}
								{!isPreview && (
									<Cell>
										<Button onClick={() => removeItem(index)} icon="faTrash" />
									</Cell>
								)}
							</>
						);
					}}
				/>
			)}

			{!isPreview && (
				<div className="flex gap-2">
					<Button className="flex-1" onClick={addItem}>
						Add Item
					</Button>

					<Button className="flex-1" type="submit">
						Submit
					</Button>
				</div>
			)}
		</div>
	);
}

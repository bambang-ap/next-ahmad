import {Control, useController, UseFormReset, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
} from '@appTypes/app.type';
import {TItemUnit} from '@appTypes/app.zod';
import {Button, Input, Select, SelectPropsData, Table} from '@components';
import {CRUD_ENABLED} from '@enum';
import {trpc} from '@utils/trpc';

const selectUnitData = [
	{value: 'pcs'},
	{value: 'kg'},
	{value: 'box'},
	{value: 'set'},
	{value: 'carton'},
] as SelectPropsData<TItemUnit>[];

export type UQtyList = `qty${typeof qtyList[number]}`;
export const qtyList = [1, 2, 3] as const;

export type FormType = TCustomerPO & {
	type: ModalTypePreview;
} & Pick<TCustomerPOExtended, 'po_item'>;

export default function PoModalChild({
	control,
	reset: resetForm,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const [modalType, poItem = []] = useWatch({
		control,
		name: ['type', 'po_item'],
	});

	const {data} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	const {
		field: {onChange: onChangePoItem},
	} = useController({control, name: 'po_item'});

	const {headerTable, isPreview} = {
		get isPreview() {
			return modalType === 'preview';
		},
		get headerTable() {
			const tableHeader = [
				'Name',
				'Kode Item',
				'Harga',
				...qtyList.map(num => `Jumlah ${num}`),
			];

			if (this.isPreview) return tableHeader;
			return [...tableHeader, 'Action'];
		},
	};

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
				po_item: [...po_item, {} as typeof poItem[number]],
			};
		});
	}

	if (modalType === 'delete') {
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
					className="flex-1"
					type="date"
					label="Due Date"
					disabled={isPreview}
					control={control}
					fieldName="due_date"
				/>
			</div>

			{poItem && poItem.length > 0 && (
				<Table
					className="max-h-72 overflow-y-auto"
					header={headerTable}
					data={poItem}
					renderItem={({Cell}, index) => {
						return (
							<>
								<Cell>
									<Input
										className="flex-1"
										disabled={isPreview}
										control={control}
										fieldName={`po_item.${index}.name`}
										label="Nama Item"
									/>
								</Cell>
								<Cell>
									<Input
										className="flex-1"
										disabled={isPreview}
										control={control}
										fieldName={`po_item.${index}.kode_item`}
										label="Kode Item"
									/>
								</Cell>
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
										<Button onClick={() => removeItem(index)}>Remove</Button>
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

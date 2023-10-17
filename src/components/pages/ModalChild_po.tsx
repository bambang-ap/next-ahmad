import {Fragment, useEffect} from 'react';

import {Control, useController, UseFormReset, useWatch} from 'react-hook-form';

import {ModalTypePreview, TCustomer} from '@appTypes/app.type';
import {
	Button,
	Input,
	Select,
	selectMapper,
	SelectPropsData,
	Table,
	TableProps,
} from '@components';
import {formatDate, selectUnitData} from '@constants';
import {CRUD_ENABLED} from '@enum';
import type {PoGetV2} from '@trpc/routers/customer_po';
import {modalTypeParser, moment, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

export type UQtyList = `qty${typeof qtyList[number]}`;
export const qtyList = [1, 2, 3] as const;

export type FormType = PoGetV2 & {
	type: ModalTypePreview;
	idPo?: MyObject<boolean>;
};
export default function PoModalChild({
	control,
	reset: resetForm,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const dataForm = useWatch({control});
	const {type: modalType, OrmCustomerPOItems: poItem = [], tgl_po} = dataForm;

	const {data} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	const {data: dataMasterItem} = trpc.item.get.useQuery({
		limit: 10000,
	});

	const listItems = dataMasterItem?.rows ?? [];

	const itemSelections = selectMapper(listItems, 'id', 'name');

	const {
		field: {onChange: onChangePoItem},
	} = useController({control, name: 'OrmCustomerPOItems'});

	const {isPreview, isPreviewEdit} = modalTypeParser(modalType);

	const {headerTable} = {
		get headerTable() {
			const tableHeader: TableProps<any>['header'] = [
				'No',
				'Nama Item',
				'Kode Item',
				'Harga',
				...qtyList.map(num => `Jumlah ${num}`),
			];

			if (isPreview) return tableHeader;
			return [...tableHeader, 'Action'];
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
		resetForm(({OrmCustomerPOItems = [], ...prev}) => {
			return {
				...prev,
				OrmCustomerPOItems: [
					...OrmCustomerPOItems,
					{} as typeof OrmCustomerPOItems[number],
				],
			};
		});
	}

	useEffect(() => {
		if (!!tgl_po) {
			resetForm(prev => {
				return {
					...prev,
					due_date: moment(tgl_po).add(3, 'd').format(formatDate),
				};
			});
		}
	}, [tgl_po]);

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
					disabled={isPreviewEdit}
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
						const selectedItem = listItems.find(
							e => e.id === item.master_item_id,
						);

						return (
							<Fragment key={item.id}>
								<Cell>{index + 1}</Cell>
								<Cell width="25%">
									{itemSelections.length > 0 && (
										<Select
											className="flex-1"
											label="Nama Item"
											control={control}
											data={itemSelections}
											fieldName={`OrmCustomerPOItems.${index}.master_item_id`}
										/>
									)}
								</Cell>
								<Cell>{selectedItem?.kode_item}</Cell>
								<Cell>
									<Input
										className="flex-1"
										disabled={isPreview}
										control={control}
										type="decimal"
										fieldName={`OrmCustomerPOItems.${index}.harga`}
										label="Harga"
									/>
								</Cell>
								{qtyMap(({num, qtyKey, unitKey}) => {
									return (
										<Cell key={num} className="gap-2">
											<Input
												className="flex-1"
												disabled={isPreview}
												control={control}
												type="decimal"
												fieldName={`OrmCustomerPOItems.${index}.${qtyKey}`}
												label="Qty"
											/>
											<Select
												disabled={isPreview}
												className="flex-1"
												firstOption="- Pilih unit -"
												control={control}
												fieldName={`OrmCustomerPOItems.${index}.${unitKey}`}
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
							</Fragment>
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

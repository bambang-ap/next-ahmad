import {Fragment, useEffect} from 'react';

import {Control, useController, UseFormReset, useWatch} from 'react-hook-form';

import {SelectCustomer} from '@appComponent/PageTable/SelectCustomer';
import {ModalTypePreview, TCustomer, TItemUnit} from '@appTypes/app.type';
import {
	Button,
	Input,
	Select,
	selectMapper,
	Table,
	TableProps,
} from '@components';
import {formatDate, selectUnitData} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {useSession} from '@hooks';
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
	const {isAdmin} = useSession();
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
				<SelectCustomer
					data={data}
					control={control}
					className="flex-1"
					fieldName="id_customer"
					disabled={isPreviewEdit}
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
								{!selectedItem ? (
									<Cell colSpan={headerTable.length - 2} />
								) : (
									<>
										<Cell>{selectedItem?.kode_item}</Cell>
										<Cell>
											<Input
												shouldUnregister
												label="Harga"
												type="decimal"
												control={control}
												className="flex-1"
												disabled={isPreview || !isAdmin}
												key={selectedItem?.id}
												defaultValue={selectedItem?.harga}
												fieldName={`OrmCustomerPOItems.${index}.harga`}
											/>
										</Cell>
										{qtyMap(({num, qtyKey, unitKey}) => {
											const theVal = item[qtyKey];
											const isThird = num === 3,
												isSecond = num === 2;
											const isTwoOrThree = isSecond || isThird;

											const presetUnit: undefined | TItemUnit = isSecond
												? 'pcs'
												: isThird
												? 'kg'
												: undefined;

											const shouldUnregister = isTwoOrThree && !!theVal;
											const presetUnitValue = isTwoOrThree
												? !!theVal
													? presetUnit
													: undefined
												: presetUnit;

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
													{!!presetUnit ? (
														<Input
															disabled
															label="Unit"
															control={control}
															className="flex-1"
															placeholder={presetUnit}
															defaultValue={presetUnitValue}
															shouldUnregister={shouldUnregister}
															fieldName={`OrmCustomerPOItems.${index}.${unitKey}`}
														/>
													) : (
														<Select
															disabled={isPreview}
															className="flex-1"
															firstOption="- Pilih unit -"
															control={control}
															fieldName={`OrmCustomerPOItems.${index}.${unitKey}`}
															data={selectUnitData}
															label="Unit"
														/>
													)}
												</Cell>
											);
										})}
										{!isPreview && (
											<Cell>
												<Button
													onClick={() => removeItem(index)}
													icon="faTrash"
												/>
											</Cell>
										)}
									</>
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

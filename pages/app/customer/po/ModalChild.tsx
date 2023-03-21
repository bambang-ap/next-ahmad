import {Control, useController, useForm, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
	TPOItem,
} from '@appTypes/app.type';
import {TItemUnit} from '@appTypes/app.zod';
import {Button, Input, Select, SelectPropsData, Table, Text} from '@components';
import {CRUD_ENABLED} from '@enum';
import {trpc} from '@utils/trpc';

const selectUnitData = [
	{value: 'pcs'},
	{value: 'kg'},
	{value: 'box'},
	{value: 'set'},
	{value: 'carton'},
] as SelectPropsData<TItemUnit>[];

export const qtyList = [1, 2, 3] as const;

export type FormType = TCustomerPO & {
	type: ModalTypePreview;
} & Pick<TCustomerPOExtended, 'po_item'>;

export default function ModalChild({control}: {control: Control<FormType>}) {
	const [modalType, poItem = []] = useWatch({
		control,
		name: ['type', 'po_item'],
	});

	const {data} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {reset, handleSubmit, control: poItemControl} = useForm<TPOItem>();
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

	const submitItem = handleSubmit(item => {
		onChangePoItem([...poItem, item]);
		reset({});
	});

	function removeItem(index: number) {
		onChangePoItem(poItem?.remove(index));
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
			<Select
				disabled={isPreview}
				firstOption="- Pilih customer -"
				control={control}
				data={mappedData}
				fieldName="id_customer"
			/>
			<Input disabled={isPreview} control={control} fieldName="nomor_po" />
			<Input
				type="date"
				disabled={isPreview}
				control={control}
				fieldName="tgl_po"
			/>
			<Input
				type="date"
				disabled={isPreview}
				control={control}
				fieldName="due_date"
			/>

			{!isPreview && (
				<>
					<Text className="flex self-center">PO Items</Text>
					<div className="gap-x-2 flex">
						<div className="flex flex-1 gap-x-2">
							<Input
								className="flex-1"
								disabled={isPreview}
								control={poItemControl}
								fieldName="name"
							/>
							<Input
								className="flex-1"
								disabled={isPreview}
								control={poItemControl}
								fieldName="kode_item"
							/>
							<Input
								className="flex-1"
								type="number"
								disabled={isPreview}
								control={poItemControl}
								fieldName="harga"
							/>

							{qtyList.map(num => {
								return (
									<>
										<Input
											className="flex-1"
											disabled={isPreview}
											control={poItemControl}
											type="number"
											fieldName={`qty${num}`}
										/>
										<Select
											firstOption="- Pilih unit -"
											control={poItemControl}
											fieldName={`unit${num}`}
											data={selectUnitData}
										/>
									</>
								);
							})}
						</div>
						<Button onClick={submitItem}>Add</Button>
					</div>
				</>
			)}

			{poItem && (
				<Table
					className="max-h-72 overflow-y-auto"
					header={headerTable}
					data={poItem}
					renderItem={({Cell, item}, index) => {
						return (
							<>
								<Cell>
									<Input
										className="flex-1"
										disabled={isPreview}
										control={control}
										fieldName={`po_item.${index}.name`}
									/>
								</Cell>
								<Cell>
									<Input
										className="flex-1"
										disabled={isPreview}
										control={control}
										fieldName={`po_item.${index}.kode_item`}
									/>
								</Cell>
								<Cell>
									<Input
										className="flex-1"
										disabled={isPreview}
										control={control}
										type="number"
										fieldName={`po_item.${index}.harga`}
									/>
								</Cell>
								{qtyList.map(num => {
									return (
										<Cell key={num}>
											<div className="flex gap-2">
												<Input
													className="flex-1"
													disabled={isPreview}
													control={control}
													type="number"
													fieldName={`po_item.${index}.qty${num}`}
												/>
												<Select
													disabled={isPreview}
													className="w-1/2"
													firstOption="- Pilih unit -"
													control={control}
													fieldName={`po_item.${index}.unit${num}`}
													data={selectUnitData}
												/>
											</div>
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
				<Button className="w-full" type="submit">
					Submit
				</Button>
			)}
		</div>
	);
}

import {FormEventHandler, useRef} from 'react';

import {Control, useController, useForm, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
	TPOItem,
} from '@appTypes/app.type';
import {TItemUnit} from '@appTypes/app.zod';
import {
	Button,
	Input,
	Modal,
	ModalRef,
	Select,
	SelectPropsData,
	Table,
	Text,
} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

type FormType = TCustomerPO & {
	type: ModalTypePreview;
} & Pick<TCustomerPOExtended, 'po_item'>;

const selectUnitData = [
	{value: 'pcs'},
	{value: 'kg'},
	{value: 'box'},
	{value: 'set'},
	{value: 'carton'},
] as SelectPropsData<TItemUnit>[];

POCustomer.getLayout = getLayout;
export default function POCustomer() {
	const modalRef = useRef<ModalRef>(null);
	const insertPO = trpc.customer_po.add.useMutation();
	const updatePO = trpc.customer_po.update.useMutation();
	const deletePO = trpc.customer_po.delete.useMutation();

	const {data, refetch} = trpc.customer_po.get.useQuery({type: 'customer_po'});
	const {control, handleSubmit, watch, reset, clearErrors} =
		useForm<FormType>();

	const modalType = watch('type');
	const {modalTitle} = {
		get modalTitle() {
			if (modalType === 'add') return 'Tambah Customer PO';
			if (modalType === 'edit') return 'Edit Customer PO';
			if (modalType === 'delete') return 'Hapus Customer PO';
			return 'Customer PO';
		},
	};

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, id, ...rest}) => {
			const onSuccess = () => {
				modalRef.current?.hide();
				refetch();
			};

			switch (type) {
				case 'add':
					return insertPO.mutate(rest, {onSuccess});
				case 'edit':
					return updatePO.mutate({id, ...rest}, {onSuccess});
				case 'delete':
					return deletePO.mutate(id, {onSuccess});
			}

			return null;
		})();
	};

	function showModal(type: ModalTypePreview, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal size="7xl" title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<ModalChild control={control} />
				</form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<Button onClick={() => showModal('add', {})}>Add</Button>

				<Table
					data={data ?? []}
					header={['Nomor PO', 'Customer', 'Tanggal', 'Due Date', 'Action']}
					renderItem={({item, Cell}) => {
						const {id, customer, tgl_po, due_date, nomor_po} = item;

						return (
							<>
								<Cell>{nomor_po}</Cell>
								<Cell>{customer?.name}</Cell>
								<Cell>{tgl_po}</Cell>
								<Cell>{due_date}</Cell>
								<Cell className="flex gap-x-2">
									<Button onClick={() => showModal('preview', item)}>
										Preview
									</Button>
									<Button onClick={() => showModal('edit', item)}>Edit</Button>
									<Button onClick={() => showModal('delete', {id})}>
										Delete
									</Button>
								</Cell>
							</>
						);
					}}
				/>
			</div>
		</>
	);
}

const ModalChild = ({control}: {control: Control<FormType>}) => {
	const [modalType, poItem, idPo] = useWatch({
		control,
		name: ['type', 'po_item', 'id'],
	});

	const {data} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {reset, handleSubmit, control: poItemControl} = useForm<TPOItem>();
	const {
		field: {onChange: onChangePoItem},
	} = useController({control, name: 'po_item'});

	const isPreview = modalType === 'preview';
	const isEdit = modalType === 'edit';
	const mappedData = (data ?? []).map<SelectPropsData>(({name, id}) => ({
		label: name,
		value: id,
	}));

	const submitItem = handleSubmit(item => {
		onChangePoItem([item].concat(poItem ?? []));
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
								disabled={isPreview}
								control={poItemControl}
								type="number"
								fieldName="qty1"
							/>
							<Select
								firstOption="- Pilih unit -"
								control={poItemControl}
								fieldName="unit1"
								data={selectUnitData}
							/>
							<Input
								className="flex-1"
								disabled={isPreview}
								control={poItemControl}
								type="number"
								fieldName="qty2"
							/>
							<Select
								firstOption="- Pilih unit -"
								control={poItemControl}
								fieldName="unit2"
								data={selectUnitData}
							/>
							<Input
								className="flex-1"
								disabled={isPreview}
								control={poItemControl}
								type="number"
								fieldName="qty3"
							/>
							<Select
								firstOption="- Pilih unit -"
								control={poItemControl}
								fieldName="unit3"
								data={selectUnitData}
							/>
						</div>
						<Button onClick={submitItem}>Add</Button>
					</div>
				</>
			)}

			{poItem && (
				<Table
					className="max-h-72 overflow-y-auto"
					header={
						isPreview
							? ['Name', 'Kode Item', 'Jumlah 1', 'Jumlah 2', 'Jumlah 3']
							: [
									'Name',
									'Kode Item',
									'Jumlah 1',
									'Jumlah 2',
									'Jumlah 3',
									'Action',
							  ]
					}
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
									<div className="flex gap-2">
										<Input
											className="flex-1"
											disabled={isPreview}
											control={control}
											type="number"
											fieldName={`po_item.${index}.qty1`}
										/>
										<Select
											firstOption="- Pilih unit -"
											control={control}
											fieldName={`po_item.${index}.unit1`}
											data={selectUnitData}
										/>
									</div>
								</Cell>
								<Cell>
									<div className="flex gap-2">
										<Input
											className="flex-1"
											disabled={isPreview}
											control={control}
											type="number"
											fieldName={`po_item.${index}.qty2`}
										/>
										<Select
											firstOption="- Pilih unit -"
											control={control}
											fieldName={`po_item.${index}.unit2`}
											data={selectUnitData}
										/>
									</div>
								</Cell>
								<Cell>
									<div className="flex gap-2">
										<Input
											className="flex-1"
											disabled={isPreview}
											control={control}
											type="number"
											fieldName={`po_item.${index}.qty3`}
										/>
										<Select
											firstOption="- Pilih unit -"
											control={control}
											fieldName={`po_item.${index}.unit3`}
											data={selectUnitData}
										/>
									</div>
								</Cell>
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
};

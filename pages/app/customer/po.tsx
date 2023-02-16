import {useRef} from 'react';

import {Control, useController, useForm, useWatch} from 'react-hook-form';

import {ModalTypePreview, TCustomerPO, TPOItem} from '@appTypes/app.type';
import {
	Button,
	Input,
	Modal,
	ModalRef,
	Select,
	SelectPropsData,
	Table,
} from '@components';
import {getLayout} from '@hoc';
import {
	useFetchCustomer,
	useFetchCustomerPO,
	useManageCustomerPO,
} from '@queries';

type FormType = TCustomerPO & {
	type: ModalTypePreview;
};

POCustomer.getLayout = getLayout;
export default function POCustomer() {
	const modalRef = useRef<ModalRef>(null);
	const manageCustomerPO = useManageCustomerPO();

	const {data, refetch} = useFetchCustomerPO();
	const {control, handleSubmit, watch, reset} = useForm<FormType>();

	const modalType = watch('type');
	const {modalTitle} = {
		get modalTitle() {
			if (modalType === 'add') return 'Tambah Customer PO';
			if (modalType === 'edit') return 'Edit Customer PO';
			if (modalType === 'delete') return 'Hapus Customer PO';
			return 'Customer PO';
		},
	};

	const submit = handleSubmit(({type, id, ...rest}) => {
		const onSuccess = () => {
			modalRef.current?.hide();
			refetch();
		};

		switch (type) {
			case 'add':
				return manageCustomerPO.post.mutate(rest, {onSuccess});
			case 'edit':
				return manageCustomerPO.put.mutate({...rest, id}, {onSuccess});
			case 'delete':
				return manageCustomerPO.delete.mutate(
					{nomor_po: rest.nomor_po},
					{onSuccess},
				);
		}

		return null;
	});

	function showModal(type: ModalTypePreview, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<ModalChild control={control} />
				</form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<Button onClick={() => showModal('add', {})}>Add</Button>

				<Table
					data={data?.data ?? []}
					header={['Name', 'Nomor PO', 'Customer', 'Action']}
					renderItem={({item, Cell}) => {
						const {name, customer, nomor_po} = item;

						return (
							<>
								<Cell>{name}</Cell>
								<Cell>{nomor_po}</Cell>
								<Cell>{customer?.name}</Cell>
								<Cell className="flex gap-x-2">
									<Button onClick={() => showModal('preview', item)}>
										Preview
									</Button>
									<Button onClick={() => showModal('edit', item)}>Edit</Button>
									<Button onClick={() => showModal('delete', {nomor_po})}>
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
	const [modalType, poItem] = useWatch({control, name: ['type', 'po_item']});

	const {data} = useFetchCustomer();
	const {reset, handleSubmit, control: poItemControl} = useForm<TPOItem>();
	const {
		field: {onChange: onChangePoItem},
	} = useController({control, name: 'po_item'});

	const isPreview = modalType === 'preview';
	const isEdit = modalType === 'edit';
	const mappedData = (data?.data ?? []).map<SelectPropsData>(({name, id}) => ({
		label: name,
		value: id,
	}));

	const submitItem = handleSubmit(({name}) => {
		onChangePoItem([{name}].concat(poItem ?? []));
		reset({name: ''});
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
			<Input disabled={isPreview} control={control} fieldName="name" />
			<Input
				disabled={isPreview || isEdit}
				control={control}
				fieldName="nomor_po"
			/>
			<Select
				disabled={isPreview}
				firstOption="- Pilih customer -"
				control={control}
				data={mappedData}
				fieldName="id_customer"
			/>

			{!isPreview && (
				<div className="gap-x-2 flex">
					<div className="flex-1">
						<Input
							disabled={isPreview}
							control={poItemControl}
							fieldName="name"
						/>
					</div>
					<Button onClick={submitItem}>Add</Button>
				</div>
			)}

			{poItem && (
				<Table
					className="max-h-72 overflow-y-auto"
					header={isPreview ? ['Name'] : ['Name', 'Action']}
					data={poItem}
					renderItem={({Cell, item}, index) => {
						return (
							<>
								<Cell>{item.name}</Cell>
								{!isPreview && (
									<Button onClick={() => removeItem(index)}>Remove</Button>
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
import {useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {ModalTypePreview, TCustomerPO} from '@appTypes/app.type';
import {Button, Modal, ModalRef, Table, Text} from '@components';
import {getLayout} from '@hoc';
import {useFetchCustomerPO, useManageCustomerPO} from '@queries';

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
				return manageCustomerPO.delete.mutate({id}, {onSuccess});
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
					header={['Name', 'Nomor PO', 'ID Customer', 'Action']}
					renderItem={({item}) => {
						const {id, id_customer, name, nomor_po} = item;

						return (
							<>
								<td>
									<Text>{name}</Text>
								</td>
								<td>
									<Text>{nomor_po}</Text>
								</td>
								<td>
									<Text>{id_customer}</Text>
								</td>
								<td className="flex">
									<Button>Preview</Button>
									<Button onClick={() => showModal('edit', item)}>Edit</Button>
									<Button onClick={() => showModal('delete', {id})}>
										Delete
									</Button>
								</td>
							</>
						);
					}}
				/>
			</div>
		</>
	);
}

const ModalChild = ({control}: {control: Control<FormType>}) => {
	const modalType = useWatch({control, name: 'type'});

	if (modalType === 'delete') {
		return (
			<div>
				<label>Hapus ?</label>
				<Button type="submit">Ya</Button>
			</div>
		);
	}

	return (
		<>
			<Button type="submit">Submit</Button>
		</>
	);
};

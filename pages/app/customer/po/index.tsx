import {FormEventHandler, useRef} from 'react';

import {useForm} from 'react-hook-form';

import {ModalTypePreview} from '@appTypes/app.type';
import {Button, Modal, ModalRef, Table} from '@components';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

import ModalChild, {FormType} from './ModalChild';

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
	const isDelete = modalType === 'delete';
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
				default:
					return null;
			}
		})();
	};

	function showModal(type: ModalTypePreview, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal
				ref={modalRef}
				title={modalTitle}
				size={isDelete ? undefined : '7xl'}>
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
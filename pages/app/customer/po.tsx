import {FormEventHandler, useRef} from 'react';

import {useForm} from 'react-hook-form';

import {ModalTypePreview} from '@appTypes/app.type';
import {Button, Modal, ModalRef, TableFilter} from '@components';
import {defaultErrorMutation} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilter} from '@hooks';
import PoModalChild, {FormType} from '@pageComponent/ModalChild_po';
import {trpc} from '@utils/trpc';

POCustomer.getLayout = getLayout;
export default function POCustomer() {
	const modalRef = useRef<ModalRef>(null);

	const insertPO = trpc.customer_po.add.useMutation(defaultErrorMutation);
	const updatePO = trpc.customer_po.update.useMutation(defaultErrorMutation);
	const deletePO = trpc.customer_po.delete.useMutation(defaultErrorMutation);
	const {hookForm, formValue} = useTableFilter();

	const {control, handleSubmit, watch, reset, clearErrors} = useForm<FormType>({
		// resolver: zodResolver(validationSchema),
	});

	const {refetch: refetchH} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
	});
	const {data, refetch} = trpc.customer_po.getPage.useQuery({
		type: 'customer_po',
		...formValue,
	});

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
		handleSubmit(({type, id, po_item = [], ...rest}) => {
			const onSuccess = () => {
				modalRef.current?.hide();
				refetch();
				refetchH();
			};

			switch (type) {
				case 'add':
					return insertPO.mutate({...rest, po_item}, {onSuccess});
				case 'edit':
					return updatePO.mutate({id, po_item, ...rest}, {onSuccess});
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
					<PoModalChild reset={reset} control={control} />
				</form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<TableFilter
					form={hookForm}
					data={data?.rows}
					pageCount={data?.totalPage}
					header={['Nomor PO', 'Customer', 'Tanggal', 'Due Date', 'Action']}
					topComponent={
						<Button onClick={() => showModal('add', {})}>Add</Button>
					}
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

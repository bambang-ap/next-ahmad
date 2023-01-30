import {useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {ModalType, TRole} from '@appTypes/app.type';
import {Input, Modal, ModalRef, Table} from '@components';
import {getLayout} from '@hoc';
import {useFetchRole, useManageRole} from '@queries';

type RoleForm = Partial<TRole> & {
	type: ModalType;
};

export default function Role() {
	const modalRef = useRef<ModalRef>(null);
	const manageRole = useManageRole();

	const {data, refetch} = useFetchRole();
	const {control, handleSubmit, watch, reset} = useForm<RoleForm>({});

	const modalType = watch('type');
	const modalTitle =
		modalType === 'add'
			? 'Tambah role'
			: modalType === 'edit'
			? 'Ubah role'
			: 'Hapus role?';
	const submit = handleSubmit(({type, id, name}) => {
		const onSuccess = () => {
			modalRef.current?.hide();
			refetch();
		};

		switch (type) {
			case 'add':
				return manageRole.post.mutate({name}, {onSuccess});
			case 'edit':
				return manageRole.put.mutate({name, id}, {onSuccess});
			case 'delete':
				return manageRole.delete.mutate({id}, {onSuccess});
			default:
				return;
		}
	});

	function showModal(type: ModalType, initValue: Omit<RoleForm, 'type'>) {
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
				<button onClick={() => showModal('add', {})}>Add</button>

				<Table
					data={data?.data ?? []}
					header={['Role', 'Action']}
					renderItem={({item: {id, name}}) => {
						return (
							<>
								<td>{name}</td>
								<td>
									<div>
										<button onClick={() => showModal('edit', {id, name})}>
											Edit
										</button>
										<button onClick={() => showModal('delete', {id})}>
											Delete
										</button>
									</div>
								</td>
							</>
						);
					}}
				/>
			</div>
		</>
	);
}

Role.getLayout = getLayout;

const ModalChild = ({control}: {control: Control<RoleForm>}) => {
	const modalType = useWatch({control, name: 'type'});

	if (modalType === 'delete') {
		return (
			<div>
				<label>Hapus ?</label>
				<button type="submit">Ya</button>
			</div>
		);
	}

	return (
		<>
			<Input control={control} fieldName="name" placeholder="name" />
			<button type="submit">Submit</button>
		</>
	);
};

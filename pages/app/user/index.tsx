import {useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {TUser} from '@appTypes/app.type';
import {Input, Modal, ModalRef} from '@components';
import {getLayout} from '@hoc';
import {useFetchUser, useManageUser} from '@queries';

type ModalType = 'add' | 'edit' | 'delete';
type UserForm = {
	type: ModalType;
} & Partial<TUser>;

export default function User() {
	const modalRef = useRef<ModalRef>(null);
	const manageRole = useManageUser();

	const {data, refetch} = useFetchUser();
	const {control, handleSubmit, watch, reset} = useForm<UserForm>({});

	const modalType = watch('type');
	const modalTitle =
		modalType === 'add'
			? 'Tambah user'
			: modalType === 'edit'
			? 'Ubah user'
			: 'Hapus user?';

	const submit = handleSubmit(({type, ...values}) => {
		const {id} = values;

		const onSuccess = () => {
			modalRef.current?.hide();
			refetch();
		};

		switch (type) {
			case 'add':
				return manageRole.post.mutate({...values, id: uuid()}, {onSuccess});
			case 'edit':
				return manageRole.put.mutate(values, {onSuccess});
			case 'delete':
				return manageRole.delete.mutate({id}, {onSuccess});
			default:
				return;
		}
	});

	function showModal(type: ModalType, initValue: Omit<UserForm, 'type'>) {
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

				<table className="table-auto overflow-scroll w-full">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{data?.data.map(user => {
							const {id, email, role, name} = user;
							return (
								<tr key={id}>
									<td>{name}</td>
									<td>{email}</td>
									<td>{role}</td>
									<td>
										<div>
											<button onClick={() => showModal('edit', user)}>
												Edit
											</button>
											<button onClick={() => showModal('delete', {id})}>
												Delete
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</>
	);
}

User.getLayout = getLayout;

const ModalChild = ({control}: {control: Control<UserForm>}) => {
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
			<Input control={control} fieldName="email" placeholder="email" />
			<Input control={control} fieldName="role" placeholder="role" />
			<Input control={control} fieldName="password" placeholder="password" />
			<button type="submit">Submit</button>
		</>
	);
};

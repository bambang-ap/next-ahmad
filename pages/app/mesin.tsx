import {useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {ModalType, TMesin} from '@appTypes/app.type';
import {Input, Modal, ModalRef, Table} from '@components';
import {getLayout} from '@hoc';
import {useFetchMesin, useManageMesin} from '@queries';

type MesinForm = TMesin & {
	type: ModalType;
};

export default function Mesin() {
	const modalRef = useRef<ModalRef>(null);
	const manageMesin = useManageMesin();

	const {data, refetch} = useFetchMesin();
	const {control, handleSubmit, watch, reset} = useForm<MesinForm>({});

	const modalType = watch('type');
	const modalTitle =
		modalType === 'add'
			? 'Tambah mesin'
			: modalType === 'edit'
			? 'Ubah mesin'
			: 'Hapus mesin?';
	const submit = handleSubmit(({type, id, name, nomor_mesin}) => {
		const onSuccess = () => {
			modalRef.current?.hide();
			refetch();
		};

		switch (type) {
			case 'add':
				return manageMesin.post.mutate({name, nomor_mesin}, {onSuccess});
			case 'edit':
				return manageMesin.put.mutate({name, id, nomor_mesin}, {onSuccess});
			case 'delete':
				return manageMesin.delete.mutate({id}, {onSuccess});
			default:
				return;
		}
	});

	function showModal(type: ModalType, initValue: Omit<MesinForm, 'type'>) {
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
					header={['Mesin', 'Action']}
					renderItem={({item}) => {
						const {id, name} = item;
						return (
							<>
								<td>{name}</td>
								<td>
									<div>
										<button onClick={() => showModal('edit', item)}>
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

Mesin.getLayout = getLayout;

const ModalChild = ({control}: {control: Control<MesinForm>}) => {
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

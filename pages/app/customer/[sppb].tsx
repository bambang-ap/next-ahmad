import {useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {ModalType, TCustomerSPPBIn} from '@appTypes/app.type';
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
	useFetchCustomerPO,
	useFetchCustomerSPPBIn,
	useManageCustomerSPPBIn,
} from '@queries';

type FormType = TCustomerSPPBIn & {
	type: ModalType;
};

SPPB.getLayout = getLayout;
export default function SPPB() {
	const modalRef = useRef<ModalRef>(null);
	const manageCustomerPO = useManageCustomerSPPBIn();

	const {data, refetch} = useFetchCustomerSPPBIn();
	const {control, handleSubmit, watch, reset} = useForm<FormType>();

	const modalType = watch('type');
	const {modalTitle} = {
		get modalTitle() {
			if (modalType === 'add') return 'Tambah SPPB IN';
			if (modalType === 'edit') return 'Edit SPPB IN';
			if (modalType === 'delete') return 'Hapus SPPB IN';
			return 'SPPB IN';
		},
	};

	const submit = handleSubmit(({type, id, ...rest}) => {
		const onSuccess = () => {
			modalRef.current?.hide();
			refetch();
		};

		switch (type) {
			case 'edit':
				return manageCustomerPO.put.mutate({...rest, id}, {onSuccess});
			case 'delete':
				return manageCustomerPO.delete.mutate({id}, {onSuccess});
		}

		return manageCustomerPO.post.mutate(rest, {onSuccess});
	});

	function showModal(type: ModalType, initValue: {}) {
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
					header={['Name', 'Nomor PO', 'Action']}
					renderItem={({item, Cell}) => {
						const {id, ...rest} = item;
						const {name, nomor_po} = rest;

						return (
							<>
								<Cell>{name}</Cell>
								<Cell>{nomor_po}</Cell>
								<Cell className="flex gap-x-2">
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
	const [modalType] = useWatch({control, name: ['type']});

	const {data} = useFetchCustomerPO();

	const mappedData = (data?.data ?? []).map<SelectPropsData>(({nomor_po}) => ({
		value: nomor_po,
	}));

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
			<Input control={control} fieldName="name" />
			<Select
				firstOption="- Pilih PO -"
				control={control}
				data={mappedData}
				fieldName="nomor_po"
			/>

			<Button className="w-full" type="submit">
				Submit
			</Button>
		</div>
	);
};

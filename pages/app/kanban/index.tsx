import {useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {ModalTypePreview, TKanban} from '@appTypes/app.type';
import {
	Button,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Table,
} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

type FormType = TKanban & {
	type: ModalTypePreview;
};

POCustomer.getLayout = getLayout;
export default function POCustomer() {
	const modalRef = useRef<ModalRef>(null);
	const insertPO = trpc.kanban.add.useMutation();
	const updatePO = trpc.kanban.update.useMutation();
	const deletePO = trpc.kanban.delete.useMutation();

	const {data, refetch} = trpc.kanban.get.useQuery({
		type: 'kanban',
	});
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
				return insertPO.mutate(rest, {onSuccess});
			case 'edit':
				return updatePO.mutate({...rest, id}, {onSuccess});
			case 'delete':
				return deletePO.mutate({nomor_po: rest.nomor_po}, {onSuccess});
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
					data={data ?? []}
					header={[
						'ID',
						'Nomor PO',
						'Nama Mesin',
						'Instruksi Kanban',
						'Customer',
						'Action',
					]}
					renderItem={({item, Cell}) => {
						const {id, nomor_po, mesin, instruksi_kanban, po} = item;

						return (
							<>
								<Cell>{id}</Cell>
								<Cell>{nomor_po}</Cell>
								<Cell>{mesin?.[0]?.name}</Cell>
								<Cell>{instruksi_kanban?.[0]?.name}</Cell>
								<Cell>{po?.[0]?.customer?.name}</Cell>
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
	const [modalType, id] = useWatch({control, name: ['type', 'id']});
	const {data: qrImage} = trpc.qr.useQuery(id);
	const {data: dataMesin} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.MESIN,
	});
	const {data: dataInstruksi} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
	});
	const {data: dataPo} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
	});

	const isPreview = modalType === 'preview';

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
				firstOption="- Pilih PO -"
				control={control}
				data={selectMapper(dataPo ?? [], 'nomor_po')}
				fieldName="nomor_po"
			/>
			<Select
				disabled={isPreview}
				firstOption="- Pilih Instruksi -"
				control={control}
				data={selectMapper(dataInstruksi ?? [], 'id', 'name')}
				fieldName="id_instruksi_kanban"
			/>
			<Select
				disabled={isPreview}
				firstOption="- Pilih Mesin -"
				control={control}
				data={selectMapper(dataMesin ?? [], 'id', 'name')}
				fieldName="id_mesin"
			/>

			{isPreview && qrImage && (
				<div className="bg-white h-52 flex self-center mt-4">
					<img alt="qr_svg" src={qrImage} className="h-full" />
				</div>
			)}

			{!isPreview && (
				<Button className="w-full" type="submit">
					Submit
				</Button>
			)}
		</div>
	);
};

import {useRef} from 'react';

import {jsPDF} from 'jspdf';
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

	const {data: qrImages} = trpc.qr.useQuery(
		{input: data?.map(f => f.id), type: 'png'},
		{enabled: !!data},
	);

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
						'Nomor PO',
						'Nama Mesin',
						'Instruksi Kanban',
						'Customer',
						'Action',
					]}
					renderItemEach={({Cell, item}, i) => {
						const {id, po, instruksi_kanban, mesin, nomor_po, sppbin} = item;
						const {customer, po_item} = po?.[0] ?? {};
						const {name: nameMesin, nomor_mesin} = mesin?.[0] ?? {};
						return (
							// <Cell colSpan={6} className="-z-10 fixed">
							<Cell colSpan={6} className="p-4 fixed -z-10">
								<div className="p-4 w-[500px]" id={`data-${item.id}`}>
									<div className="bg-black p-1 rounded gap-1 flex flex-col">
										<div className="bg-white flex-1 text-center p-2">
											Kartu Kanban
										</div>
										<div className="flex flex-row-reverse gap-1">
											<div className="bg-white flex gap-1 flex-1 flex-col justify-center items-center">
												<img
													alt="qr_svg"
													src={qrImages?.[i]}
													className="h-32 w-32"
												/>
												<label className="text-center">{id}</label>
											</div>
											<div className="flex flex-col gap-1 flex-1">
												<div className="gap-1 flex flex-1">
													<div className="bg-white flex-1 p-1">Customer</div>
													<div className="bg-white flex-1 p-1">
														{customer?.name}
													</div>
												</div>
												<div className="flex gap-1">
													<div className="bg-white flex-1 p-1">instruksi</div>
													<div className="bg-white flex-1 p-1">
														{instruksi_kanban?.[0]?.name}
													</div>
												</div>
												<div className="flex gap-1">
													<div className="bg-white flex-1 p-1">nama mesin</div>
													<div className="bg-white flex-1 p-1">{nameMesin}</div>
												</div>
												<div className="flex gap-1">
													<div className="bg-white flex-1 p-1">nomor mesin</div>
													<div className="bg-white flex-1 p-1">
														{nomor_mesin}
													</div>
												</div>
											</div>
										</div>
										<div className="bg-white flex-1 text-center p-2">
											List Item
										</div>
										<div className="flex flex-1 gap-1">
											<div className="bg-white p-1 w-2/12">
												Nomor surat jalan
											</div>
											<div className="flex flex-1 gap-1">
												<div className="bg-white flex-1 p-1">kode_item</div>
												<div className="bg-white flex-1 p-1">name</div>
												<div className="bg-white flex-1 p-1">qty</div>
											</div>
										</div>
										{sppbin?.map(sppb => {
											return (
												<div key={sppb.id} className="flex flex-1 gap-1">
													<div className="bg-white p-1 w-2/12">{sppb.name}</div>
													<div className="flex flex-col flex-1 gap-1">
														{sppb.items?.map(({id, qty}) => {
															const poItem = po_item?.find(
																itm => id === itm.id,
															);
															return (
																<div key={id} className="flex gap-1">
																	<div className="bg-white flex-1 p-1">
																		{poItem?.kode_item}
																	</div>
																	<div className="bg-white flex-1 p-1">
																		{poItem?.name}
																	</div>
																	<div className="bg-white flex-1 p-1">
																		{qty} {poItem?.unit}
																	</div>
																</div>
															);
														})}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</Cell>
						);
					}}
					renderItem={({item, Cell}) => {
						const {nomor_po, mesin, instruksi_kanban, po} = item;

						return (
							<>
								<Cell>{nomor_po}</Cell>
								<Cell>{mesin?.[0]?.name}</Cell>
								<Cell>{instruksi_kanban?.[0]?.name}</Cell>
								<Cell>{po?.[0]?.customer?.name}</Cell>
								<Cell className="flex gap-x-2">
									<Button
										icon="faPrint"
										onClick={() => generate(`data-${item.id}`)}
									/>
									<Button
										icon="faMagnifyingGlass"
										onClick={() => showModal('preview', item)}
									/>
									<Button
										onClick={() => showModal('edit', item)}
										icon="faEdit"
									/>
									<Button
										onClick={() => showModal('delete', {nomor_po})}
										icon="faTrash"
									/>
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
	const {data: qrImage} = trpc.qr.useQuery<any, string>(id);
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

function generate(id: string) {
	// Default export is a4 paper, portrait, using millimeters for units
	const doc = new jsPDF({unit: 'px', orientation: 'l'});

	doc.html(document.getElementById(id) ?? '', {
		windowWidth: 100,
		callback(doc) {
			doc.save('a4.pdf');
		},
	});
}

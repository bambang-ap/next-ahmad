import {FormEventHandler, useEffect, useRef} from 'react';

import {jsPDF} from 'jspdf';
import {Control, useForm, UseFormReset, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TCustomer,
	TCustomerSPPBIn,
	TKanban,
} from '@appTypes/app.type';
import {
	Button,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Table,
} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {classNames} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = TKanban & {
	type: ModalTypePreview;
	id_customer: string;
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

	const {control, handleSubmit, watch, reset, clearErrors} =
		useForm<FormType>();

	const modalType = watch('type');
	const {modalTitle} = {
		get modalTitle() {
			if (modalType === 'add') return 'Tambah Kanban';
			if (modalType === 'edit') return 'Edit Kanban';
			if (modalType === 'delete') return 'Hapus Kanban';
			return 'Kanban';
		},
	};

	const submit: FormEventHandler<HTMLFormElement> = ({preventDefault}) => {
		preventDefault();
		clearErrors();
		handleSubmit(({type, id, ...rest}) => {
			switch (type) {
				case 'add':
					return insertPO.mutate(rest, {onSuccess});
				case 'edit':
					return updatePO.mutate({...rest, id}, {onSuccess});
				case 'delete':
					return deletePO.mutate({id}, {onSuccess});
			}

			return null;
		})();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(type: ModalTypePreview, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<ModalChild reset={reset} control={control} />
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
					renderItemEach={({Cell, item}, i) => {
						const {id, po, instruksi_kanban, mesin, id_sppb_in, sppbin, items} =
							item;
						const {customer, po_item} = po?.[0] ?? {};
						const {name: nameMesin, nomor_mesin} = mesin?.[0] ?? {};

						const sppb = sppbin?.find(hj => hj.id === id_sppb_in);

						const partClassName = 'bg-white flex-1 p-1';

						return (
							<Cell colSpan={6} className="p-4 -z-10 fixed">
								{/* <Cell colSpan={6} className="p-4"> */}
								<div
									id={`data-${item.id}`}
									className="p-4 w-[500px]"
									style={{
										transform: 'scale(0.7) translateY(-20%) translateX(-20%)',
									}}>
									<div className="bg-black p-1 rounded gap-1 flex flex-col">
										<div className="bg-white flex-1 text-center p-2">
											{sppb?.name}
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
													<div className={partClassName}>Customer</div>
													<div className={partClassName}>{customer?.name}</div>
												</div>
												<div className="flex gap-1">
													<div className={partClassName}>instruksi</div>
													<div className={partClassName}>
														{instruksi_kanban?.[0]?.name}
													</div>
												</div>
												<div className="flex gap-1">
													<div className={partClassName}>nama mesin</div>
													<div className={partClassName}>{nameMesin}</div>
												</div>
												<div className="flex gap-1">
													<div className={partClassName}>nomor mesin</div>
													<div className={partClassName}>{nomor_mesin}</div>
												</div>
											</div>
										</div>
										<div className="bg-white flex-1 text-center p-2">
											List Item
										</div>
										<div className="flex flex-1 gap-1">
											<div className={classNames('text-center', partClassName)}>
												kode_item
											</div>
											<div className={classNames('text-center', partClassName)}>
												name
											</div>
											<div className={classNames('text-center', partClassName)}>
												qty
											</div>
										</div>
										<div className="flex flex-col flex-1 gap-1">
											{items?.map(({id, qty}) => {
												const poItem = po_item?.find(itm => id === itm.id);
												return (
													<div key={id} className="flex gap-1">
														<div className={partClassName}>
															{poItem?.kode_item}
														</div>
														<div className={partClassName}>{poItem?.name}</div>
														<div className={partClassName}>
															{qty} {poItem?.unit}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							</Cell>
						);
					}}
					renderItem={({item, Cell}) => {
						const {id, nomor_po, mesin, instruksi_kanban, po} = item;
						const id_customer = po?.[0]?.customer?.id;

						return (
							<>
								<Cell>{id}</Cell>
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
										onClick={() => showModal('preview', {...item, id_customer})}
									/>
									<Button
										onClick={() => showModal('edit', {...item, id_customer})}
										icon="faEdit"
									/>
									<Button
										onClick={() => showModal('delete', {id})}
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

const ModalChild = ({
	control,
	reset,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) => {
	const [modalType, nomor_po, id, id_customer, id_sppb_in, items] = useWatch({
		control,
		name: ['type', 'nomor_po', 'id', 'id_customer', 'id_sppb_in', 'items'],
	});
	const {data: qrImage} = trpc.qr.useQuery<any, string>(id);
	const {data: dataMesin} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.MESIN,
	});
	const {data: dataCustomer} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {data: dataInstruksi} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
	});
	const {data: dataKanban} = trpc.kanban.get.useQuery(
		{
			type: 'kanban',
			where: {id_sppb_in},
		},
		{enabled: !!id_sppb_in},
	);
	const {data: dataPo} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
	});

	const {data: dataSppbIn} = trpc.basic.get.useQuery<any, TCustomerSPPBIn[]>(
		{
			target: CRUD_ENABLED.CUSTOMER_SPPB_IN,
			where: {nomor_po},
		},
		{enabled: !!nomor_po},
	);

	const isPreview = modalType === 'preview';
	const isEdit = modalType === 'edit';
	const isEditPreview = isEdit || isPreview;

	useEffect(() => {
		reset(prevValue => {
			return {...prevValue, items: []};
		});
	}, [id_sppb_in]);

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
				firstOption="- Pilih Customer -"
				control={control}
				data={selectMapper(dataCustomer ?? [], 'id', 'name')}
				fieldName="id_customer"
			/>
			<Select
				disabled={isPreview}
				firstOption="- Pilih PO -"
				control={control}
				data={selectMapper(
					dataPo?.filter(e => e.id_customer === id_customer) ?? [],
					'nomor_po',
				)}
				fieldName="nomor_po"
			/>

			<Select
				disabled={isPreview}
				firstOption="- Pilih Surat Jalan -"
				control={control}
				data={selectMapper(dataSppbIn ?? [], 'id', 'name')}
				fieldName="id_sppb_in"
			/>
			<Table
				data={dataSppbIn?.find(e => e.id === id_sppb_in)?.items}
				renderItem={({Cell, item}, i) => {
					if (items?.[i] && items[i]?.qty === undefined) return false;

					const sItem = dataPo
						?.find(e => e.id_customer === id_customer)
						?.po_item?.find(u => u.id === item.id);

					const assignedQty = (dataKanban ?? [])
						.filter(j => j.id !== id)
						.reduce((f, e) => {
							const sItem = e.items.find(u => u.id === item.id);

							return f - (sItem?.qty ?? 0);
						}, sItem?.qty ?? 0);

					if (assignedQty <= 0) return false;

					return (
						<>
							<Cell>{sItem?.kode_item}</Cell>
							<Cell>
								<Input
									className="hidden"
									defaultValue={item.id}
									control={control}
									fieldName={`items.${i}.id`}
								/>
								<Input
									type="number"
									control={control}
									fieldName={`items.${i}.qty`}
									defaultValue={isEditPreview ? item.qty : assignedQty}
									rules={{
										max: {message: `max is ${assignedQty}`, value: assignedQty},
									}}
								/>
							</Cell>
							<Cell>
								<Button onClick={() => control.unregister(`items.${i}.qty`)}>
									Delete
								</Button>
							</Cell>
						</>
					);
				}}
			/>
			<Select
				disabled={isPreview}
				firstOption="- Pilih Mesin -"
				control={control}
				data={selectMapper(dataMesin ?? [], 'id', 'name')}
				fieldName="id_mesin"
			/>
			<Select
				disabled={isPreview}
				firstOption="- Pilih Instruksi -"
				control={control}
				data={selectMapper(dataInstruksi ?? [], 'id', 'name')}
				fieldName="id_instruksi_kanban"
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
	const doc = new jsPDF({unit: 'px', orientation: 'p'});

	doc.html(document.getElementById(id) ?? '', {
		windowWidth: 100,
		callback(doc) {
			doc.save('a4.pdf');
		},
	});
}

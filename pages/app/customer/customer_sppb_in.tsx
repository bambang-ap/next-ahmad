import {FormEventHandler, Fragment, useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {ModalTypePreview, TUpsertSppbIn} from '@appTypes/app.type';
import {Button, Input, Modal, ModalRef, Select, Table} from '@components';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

import {qtyList} from './po/ModalChild';

type FormType = {type: ModalTypePreview} & TUpsertSppbIn;

SPPBIN.getLayout = getLayout;

export default function SPPBIN() {
	const modalRef = useRef<ModalRef>(null);
	const {control, handleSubmit, setValue, watch, reset, clearErrors} =
		useForm<FormType>({defaultValues: {type: 'add'}});

	const {data} = trpc.sppb.get.useQuery({type: 'sppb_in'});
	const {mutate: mutateUpsert} = trpc.sppb.upsert.useMutation();

	const modalType = watch('type');
	const modalTitle =
		modalType === 'add'
			? `add SPPB In`
			: modalType === 'edit'
			? `edit SPPB In`
			: modalType === 'preview'
			? `preview SPPB In`
			: `delete SPPB In`;

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, ...rest}) => {
			mutateUpsert(rest);
		})();
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<TUpsertSppbIn>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Button onClick={() => showModal('add', {})}>Add</Button>

			<Table
				data={data}
				header={[
					'Nomor PO',
					'Nomor Surat Jalan',
					'Tanggal Surat Jalan',
					'Action',
				]}
				renderItem={({Cell, item}) => {
					const {id} = item;
					return (
						<>
							<Cell>{item.detailPo?.nomor_po}</Cell>
							<Cell>{item.nomor_surat}</Cell>
							<Cell>{item.tgl}</Cell>
							<Cell className="flex gap-2">
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

			<Modal title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<ModalChild control={control} />
				</form>
			</Modal>
		</>
	);
}

function ModalChild({control}: {control: Control<FormType>}) {
	const [modalType, idSppbIn, idPo] = useWatch({
		control,
		name: ['type', 'id', 'id_po'],
	});

	const {data: dataSppbIn} = trpc.sppb.get.useQuery({type: 'sppb_in'});
	const {data: listPo} = trpc.customer_po.get.useQuery({type: 'customer_po'});

	const isEdit = modalType === 'edit';
	const isPreview = modalType === 'preview';
	const isDelete = modalType === 'delete';
	const isPreviewEdit = isEdit || isPreview;

	const selectedPo = listPo?.find(e => e.id === idPo);
	const selectedSppbIn = dataSppbIn?.filter(e => e.id_po === idPo);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<>
			<Select
				disabled={isPreviewEdit}
				control={control}
				fieldName="id_po"
				firstOption="- Pilih PO -"
				data={listPo?.map(i => ({value: i.id, label: i.nomor_po}))}
			/>
			<Input
				disabled={isPreview}
				control={control}
				fieldName="nomor_surat"
				placeholder="Nomor surat jalan"
			/>
			<Input
				disabled={isPreview}
				control={control}
				fieldName="tgl"
				type="date"
				placeholder="Tanggal surat jalan"
			/>

			<Table
				data={selectedPo?.po_item}
				renderItem={({Cell, item}, index) => {
					const sppbItems =
						selectedSppbIn?.map(sppb =>
							sppb.items.find(item => item.id_item === item.id),
						) ?? [];
					const selectedSppbItem = sppbItems.find(
						item => item?.id_item === item?.id,
					);
					const assignedQty = qtyList.reduce<Record<string, number>>(
						(ret, num) => {
							const key = `qty${num}` as const;
							const qty = item?.[key] as number;

							if (!ret[key]) ret[key] = qty;

							sppbItems.forEach(item => {
								if (item?.id_sppb_in !== idSppbIn) ret[key] -= item[key];
							});

							return ret;
						},
						{},
					);

					return (
						<>
							<Input
								className="hidden"
								control={control}
								defaultValue={item.id}
								fieldName={`po_item.${index}.id_item`}
							/>
							<Cell>{item.kode_item}</Cell>
							<Cell>{item.name}</Cell>
							<Cell>{item.harga}</Cell>
							{qtyList.map(num => {
								const unit = item[`unit${num}`];

								if (!unit) return <Cell key={num} />;

								return (
									<Fragment key={num}>
										<Cell>
											<Input
												rules={{
													max: {
														value: assignedQty[`qty${num}`],
														message: `max is ${assignedQty[`qty${num}`]}`,
													},
												}}
												type="number"
												control={control}
												defaultValue={
													isEdit
														? selectedSppbItem?.[`qty${num}`]
														: assignedQty[`qty${num}`]
												}
												fieldName={`po_item.${index}.qty${num}`}
											/>
											{unit}
										</Cell>
									</Fragment>
								);
							})}
						</>
					);
				}}
			/>

			<Button type="submit">Submit</Button>
		</>
	);
}

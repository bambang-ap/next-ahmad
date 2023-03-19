import {FormEventHandler, Fragment, useEffect, useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';
import {useRecoilState} from 'recoil';

import {ModalTypePreview, TUpsertSppbIn} from '@appTypes/app.type';
import {Button, Input, Modal, ModalRef, Select, Table} from '@components';
import {defaultErrorMutation} from '@constants';
import {getLayout} from '@hoc';
import {atomExcludedItem, atomIncludedItem} from '@recoil/atoms';
import {trpc} from '@utils/trpc';

import {qtyList} from './po/ModalChild';

type FormType = {type: ModalTypePreview} & TUpsertSppbIn;

SPPBIN.getLayout = getLayout;

export default function SPPBIN() {
	const modalRef = useRef<ModalRef>(null);
	const {control, handleSubmit, watch, reset, clearErrors} = useForm<FormType>({
		defaultValues: {type: 'add'},
	});

	const {data, refetch} = trpc.sppb.get.useQuery({type: 'sppb_in'});
	const {mutate: mutateUpsert} =
		trpc.sppb.upsert.useMutation(defaultErrorMutation);
	const {mutate: mutateDelete} =
		trpc.sppb.delete.useMutation(defaultErrorMutation);

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
		handleSubmit(({type, po_item, ...rest}) => {
			if (type === 'delete') return mutateDelete({id: rest.id}, {onSuccess});

			mutateUpsert({...rest, po_item: po_item.filter(Boolean)}, {onSuccess});
		})();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
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
	const [excludedItem, setExcludedItem] = useRecoilState(atomExcludedItem);
	const [includedItem, setIncludedItem] = useRecoilState(atomIncludedItem);
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

	useEffect(() => {
		return () => {
			setExcludedItem([]);
			setIncludedItem([]);
		};
	}, []);

	if (isDelete) return <Button type="submit">Ya</Button>;

	const selectedPo = listPo?.find(e => e.id === idPo);
	const selectedSppbIn = dataSppbIn?.filter(e => e.id_po === idPo);
	const selectedSppbInn = dataSppbIn?.find(e => e.id === idSppbIn);

	function excludeItem(id: string) {
		setExcludedItem(prev => [...prev, id]);
	}

	function includeItem(id: string) {
		setExcludedItem(prev => prev.filter(item => item !== id));
	}

	function excludeItemEdit(id: string) {
		setIncludedItem(prev => prev.filter(item => item !== id));
	}

	function includeItemEdit(id: string) {
		setIncludedItem(prev => [...prev, id]);
	}

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
							sppb.items.find(itemm => itemm.id_item === item.id),
						) ?? [];
					const selectedSppbItem = selectedSppbInn?.items.find(
						itemmm => itemmm?.id_item === item?.id,
					);

					const isOnEditModal = !selectedSppbItem && isEdit;

					if (excludedItem.includes(item.id))
						return (
							<RenderReAddItem Cell={Cell} onClick={() => includeItem(item.id)}>
								{item.kode_item}
							</RenderReAddItem>
						);
					if (isOnEditModal && !includedItem.includes(item.id))
						return (
							<RenderReAddItem
								Cell={Cell}
								onClick={() => includeItemEdit(item.id)}>
								{item.kode_item}
							</RenderReAddItem>
						);

					const assignedQty = qtyList.reduce<Record<string, number>>(
						(ret, num) => {
							const key = `qty${num}` as const;
							const qty = item?.[key] as number;

							if (!ret[key]) ret[key] = qty;

							sppbItems.forEach(item => {
								if (item?.id_sppb_in !== idSppbIn && item?.[key]) {
									ret[key] -= item[key];
								}
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
								shouldUnregister
								defaultValue={item.id}
								fieldName={`po_item.${index}.id_item`}
							/>
							<Input
								className="hidden"
								control={control}
								shouldUnregister
								defaultValue={selectedSppbItem?.id}
								fieldName={`po_item.${index}.id`}
							/>
							<Cell>{item.kode_item}</Cell>
							<Cell>{item.name}</Cell>
							{qtyList.map(num => {
								const unit = item[`unit${num}`];

								if (!unit) return <Cell key={num} />;

								return (
									<Fragment key={num}>
										<Cell>
											<Input
												disabled={isPreview}
												rules={{
													max: {
														value: assignedQty[`qty${num}`],
														message: `max is ${assignedQty[`qty${num}`]}`,
													},
												}}
												type="number"
												control={control}
												shouldUnregister
												defaultValue={
													isPreviewEdit
														? selectedSppbItem?.[`qty${num}`] ||
														  assignedQty[`qty${num}`]
														: assignedQty[`qty${num}`]
												}
												fieldName={`po_item.${index}.qty${num}`}
											/>
											{unit}
										</Cell>
									</Fragment>
								);
							})}
							<Cell>
								<Button
									onClick={() =>
										isOnEditModal
											? excludeItemEdit(item.id)
											: excludeItem(item.id)
									}>
									Delete
								</Button>
							</Cell>
						</>
					);
				}}
			/>

			<Button type="submit">Submit</Button>
		</>
	);
}

function RenderReAddItem({Cell, onClick, children}) {
	return (
		<>
			<Cell colSpan={qtyList.length + 2}>{children}</Cell>
			<Cell>
				<Button onClick={onClick}>Add</Button>
			</Cell>
		</>
	);
}

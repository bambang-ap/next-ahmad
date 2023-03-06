import {useEffect, useRef} from 'react';

import {useRouter} from 'next/router';
import {useForm} from 'react-hook-form';

import {ModalTypePreview, TCustomerSPPBIn, USPPB} from '@appTypes/app.zod';
import {Button, Input, Modal, ModalRef, Select, Table, Text} from '@components';
import {getLayout} from '@hoc';
import {classNames} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {type: ModalTypePreview} & TCustomerSPPBIn;

SPPBIN.getLayout = getLayout;

export default function SPPBIN() {
	const route = useRouter();
	const {sppb: path} = route.query as {sppb: USPPB};

	if (!route.isReady) return null;

	return <RenderSPPBIN target={path} />;
}

function RenderSPPBIN({target}: {target: USPPB}) {
	const modalRef = useRef<ModalRef>(null);

	const {control, handleSubmit, setValue, watch, reset} = useForm<FormType>();

	const [modalType, nomor_po, id, items] = watch([
		'type',
		'nomor_po',
		'id',
		'items',
	]);

	const {data: listPo} = trpc.customer_po.get.useQuery({type: 'customer_po'});
	const {data, refetch} = trpc.basic.get.useQuery<any, TCustomerSPPBIn[]>({
		target,
	});
	const {data: existingPo} = trpc.sppb.get.useQuery(
		{
			where: {nomor_po},
		},
		{enabled: !!nomor_po},
	);

	console.log(existingPo);

	const {mutate: mutateUpsert} = trpc.sppb.upsert.useMutation({
		onSuccess() {
			refetch();
		},
	});
	const {mutate: mutateDelete} = trpc.sppb.delete.useMutation({
		onSuccess() {
			refetch();
		},
	});

	const isEdit = modalType === 'edit';
	const isPreview = modalType === 'preview';
	const isPreviewEdit = isEdit || isPreview;
	const modalTitle =
		modalType === 'add'
			? `add ${target}`
			: modalType === 'edit'
			? `edit ${target}`
			: modalType === 'preview'
			? `preview ${target}`
			: `delete ${target}`;

	const submit = handleSubmit(({type, ...rest}) => {
		modalRef.current?.hide();
		if (type == 'delete') return mutateDelete({target, id: rest.id});

		return mutateUpsert({data: rest, target});
	});

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<TCustomerSPPBIn>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	useEffect(() => {
		reset(prevValue => {
			return {...prevValue, nomor_po, items: existingPo};
		});
	}, [existingPo]);

	return (
		<>
			<Button onClick={() => showModal('add')}>Add</Button>

			<Table
				data={data}
				header={[
					'Nomor PO',
					'Nomor Surat Jalan',
					'Tanggal Surat Jalan',
					'Action',
				]}
				renderItem={({Cell, item}) => {
					const {id, nomor_po} = item;
					return (
						<>
							<Cell>{item.nomor_po}</Cell>
							<Cell>{item.name}</Cell>
							<Cell>{item.tgl}</Cell>
							<Cell className="flex gap-2">
								<Button onClick={() => showModal('preview', item)}>
									Preview
								</Button>
								<Button onClick={() => showModal('edit', item)}>Edit</Button>
								<Button onClick={() => showModal('delete', {id, nomor_po})}>
									Delete
								</Button>
							</Cell>
						</>
					);
				}}
			/>

			<Modal ref={modalRef} title={modalTitle}>
				<form onSubmit={submit}>
					<Select
						disabled={isPreviewEdit}
						control={control}
						fieldName="nomor_po"
						firstOption="- Pilih PO -"
						data={listPo?.map(i => ({value: i.nomor_po}))}
					/>
					<Input
						disabled={isPreview}
						control={control}
						fieldName="name"
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
						key={`${nomor_po}-${id}`}
						className={classNames({hidden: !nomor_po})}
						header={['Kode Item', 'Name', 'Jumlah']}
						data={listPo?.find(h => h.nomor_po === nomor_po)?.po_item}
						renderItem={({Cell, item}, i) => {
							if (items?.[i] && items[i]?.qty === undefined) return false;

							if (existingPo?.[i]?.qty <= 0) return false;

							return (
								<>
									<Cell>{item.kode_item}</Cell>
									<Cell>{item.name}</Cell>
									<Cell className="flex items-center gap-2">
										<Input
											className="hidden"
											defaultValue={item.id}
											control={control}
											fieldName={`items.${i}.id`}
										/>
										<Input
											disabled={isPreview}
											className="flex-1"
											type="number"
											control={control}
											defaultValue={item.qty}
											fieldName={`items.${i}.qty`}
											rules={{
												max: {
													value: item.qty,
													message: `max quantity is ${item.qty}`,
												},
											}}
										/>
										<Text>{item.unit}</Text>
									</Cell>
									<Cell>
										<Button
											onClick={() => setValue(`items.${i}.qty`, undefined)}>
											Hapus
										</Button>
									</Cell>
								</>
							);
						}}
					/>

					<Button
						type="submit"
						onClick={submit}
						className={classNames('flex-1', {hidden: !nomor_po})}>
						Submit
					</Button>
				</form>
			</Modal>
		</>
	);
}

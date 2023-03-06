import {FormEventHandler, useEffect, useRef} from 'react';

import {useRouter} from 'next/router';
import {useForm} from 'react-hook-form';

import {ModalTypePreview, TCustomerSPPBIn, USPPB} from '@appTypes/app.type';
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

	const {control, handleSubmit, setValue, watch, reset, clearErrors} =
		useForm<FormType>();
	const {data, refetch} = trpc.basic.get.useQuery<any, TCustomerSPPBIn[]>({
		target,
	});
	const {mutate} = trpc.sppb.upsert.useMutation();
	const {mutate: mutateDelete} = trpc.sppb.delete.useMutation();

	const [modalType, nomor_po, id, items] = watch([
		'type',
		'nomor_po',
		'id',
		'items',
	]);

	const {data: existingSppb} = trpc.basic.get.useQuery<any, TCustomerSPPBIn[]>(
		{
			target,
			where: {nomor_po, id: {not: id}},
		},
		{enabled: !!nomor_po},
	);

	const {data: listPo} = trpc.customer_po.get.useQuery({type: 'customer_po'});
	const {data: dataPo} = trpc.customer_po.get.useQuery(
		{type: 'customer_po', nomor_po},
		{enabled: !!nomor_po},
	);

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

	const submit: FormEventHandler<HTMLFormElement> = () => {
		clearErrors();
		handleSubmit(({type, ...rest}) => {
			if (type == 'delete')
				return mutateDelete({target, id: rest.id}, {onSuccess});

			return mutate({data: rest, target}, {onSuccess});
		})();

		function onSuccess() {
			refetch();
			modalRef.current?.hide();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<TCustomerSPPBIn>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	useEffect(() => {
		reset(prevValue => {
			return {...prevValue, nomor_po, items: []};
		});
	}, [nomor_po]);

	return (
		<>
			<Button onClick={() => showModal('add')}>Add</Button>

			<Table
				data={data}
				header={['Nomor PO', 'Nomor Surat Jalan', 'Action']}
				renderItem={({Cell, item}) => {
					const {id, nomor_po} = item;
					return (
						<>
							<Cell>{item.nomor_po}</Cell>
							<Cell>{item.name}</Cell>
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
				<form onSubmit={submit} className="flex flex-col gap-2">
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

					<Table
						key={`${nomor_po}-${id}`}
						className={classNames({hidden: !nomor_po})}
						header={['Kode Item', 'Name', 'Jumlah']}
						data={dataPo?.[0]?.po_item}
						renderItem={({Cell, item}, i) => {
							if (items?.[i] && items[i]?.qty === undefined) return false;

							const assignedQty = (existingSppb ?? []).reduce((f, e) => {
								const sItem = e.items.find(u => u.id === item.id);
								return f - (sItem?.qty ?? 0);
							}, item.qty);

							if (assignedQty <= 0) return false;

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
													value: assignedQty,
													message: `max quantity is ${assignedQty}`,
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

					{!!nomor_po && !isPreview && (
						<Button
							type="submit"
							className={classNames('flex-1', {hidden: !nomor_po})}>
							Submit
						</Button>
					)}
				</form>
			</Modal>
		</>
	);
}

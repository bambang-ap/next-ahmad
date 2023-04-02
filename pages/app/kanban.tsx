import {FormEventHandler, useRef} from 'react';

import {useForm} from 'react-hook-form';

import {ModalTypePreview, TKanbanUpsert} from '@appTypes/app.zod';
import {Button, ImageWithPreview, Modal, ModalRef, Table} from '@components';
import {defaultErrorMutation} from '@constants';
import {getLayout} from '@hoc';
import {useKanban} from '@hooks';
import {KanbanGenerateQR} from '@pageComponent/kanban_GenerateQR';
import {KanbanModalChild} from '@pageComponent/kanban_ModalChild';
import {dateUtils} from '@utils';
import {trpc} from '@utils/trpc';

Kanban.getLayout = getLayout;

export type FormType = TKanbanUpsert & {
	type: ModalTypePreview;
	id_customer: string;
	temp_id_item: string;
	callbacks?: Array<() => void>;
};

export default function Kanban() {
	useKanban();

	const modalRef = useRef<ModalRef>(null);
	const {control, watch, reset, clearErrors, handleSubmit} =
		useForm<FormType>();
	const {data, refetch} = trpc.kanban.get.useQuery({type: 'kanban'});
	const {mutate: mutateUpsert} =
		trpc.kanban.upsert.useMutation(defaultErrorMutation);
	const {mutate: mutateDelete} =
		trpc.kanban.delete.useMutation(defaultErrorMutation);

	const [modalType] = watch(['type']);

	const modalTitle =
		modalType === 'add'
			? `add Kanban`
			: modalType === 'edit'
			? `edit Kanban`
			: modalType === 'preview'
			? `preview Kanban`
			: `delete Kanban`;

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async ({type, callbacks, ...rest}) => {
			if (callbacks) callbacks.forEach(callback => callback());

			switch (type) {
				case 'add':
				case 'edit':
					return mutateUpsert(rest, {onSuccess});
				case 'delete':
					return mutateDelete(rest.id, {onSuccess});
				default:
					return null;
			}
		})();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<Omit<FormType, 'type'>>,
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
					'Image',
					'Tanggal',
					'Keterangan',
					'Nomor PO',
					'Nomor Surat Jalan',
					'Customer',
					'Created By',
					'Action',
				]}
				renderItem={({Cell, item}) => {
					// @ts-ignore
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {dataMesin, dataPo, dataSppbIn, ...rest} = item;
					return (
						<>
							<Cell>
								{item.image && (
									<ImageWithPreview className="w-20" src={item.image} />
								)}
							</Cell>
							<Cell>{dateUtils.full(item.createdAt)}</Cell>
							<Cell>{item.keterangan}</Cell>
							<Cell>{item.dataPo?.nomor_po}</Cell>
							<Cell>{item.dataSppbIn?.nomor_surat}</Cell>
							<Cell>{item.dataPo?.customer?.name}</Cell>
							<Cell>{item.dataCreatedBy?.name}</Cell>
							<Cell className="flex gap-x-2">
								<KanbanGenerateQR {...item} />
								<Button
									icon="faMagnifyingGlass"
									onClick={() => showModal('preview', rest)}
								/>
								<Button onClick={() => showModal('edit', rest)} icon="faEdit" />
								<Button
									onClick={() => showModal('delete', {id: item.id})}
									icon="faTrash"
								/>
							</Cell>
						</>
					);
				}}
			/>
			<Modal title={modalTitle} size="7xl" ref={modalRef}>
				<form onSubmit={submit}>
					<fieldset disabled={modalType === 'preview'}>
						<KanbanModalChild reset={reset} control={control} />
					</fieldset>
				</form>
			</Modal>
		</>
	);
}

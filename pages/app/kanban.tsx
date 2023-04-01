import {FormEventHandler, useEffect, useRef} from 'react';

import {useForm} from 'react-hook-form';

import {ModalTypePreview, TKanbanUpsert} from '@appTypes/app.zod';
import {Button, Modal, ModalRef, Table} from '@components';
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

	const [mesinId, modalType] = watch(['mesin_id', 'type']);

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

	useEffect(() => {
		reset(({instruksi_id, ...prev}) => {
			const idInstruksi = Object.entries(instruksi_id ?? {}).reduce<
				typeof instruksi_id
			>((ret, [idMesin, value]) => {
				const hasValue = value?.filter(Boolean);
				if (idMesin && hasValue?.length > 0) ret[idMesin] = value;
				return ret;
			}, {});
			return {...prev, instruksi_id: idInstruksi};
		});
	}, [mesinId?.join?.('')]);

	return (
		<>
			<Button onClick={() => showModal('add', {})}>Add</Button>
			<Table
				data={data}
				header={[
					'Tanggal',
					'Keterangan',
					'Nomor PO',
					'Nomor Surat Jalan',
					'Customer',
					'Material',
					'Hardness',
					'Parameter',
					'Created By',
					'Action',
				]}
				renderItem={({Cell, item}) => {
					// @ts-ignore
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {dataMesin, dataPo, dataSppbIn, ...rest} = item;
					return (
						<>
							<Cell>{dateUtils.full(item.createdAt)}</Cell>
							<Cell>{item.keterangan}</Cell>
							<Cell>{item.dataPo?.nomor_po}</Cell>
							<Cell>{item.dataSppbIn?.nomor_surat}</Cell>
							<Cell>{item.dataPo?.customer?.name}</Cell>
							<Cell>{item.dataMaterial?.name}</Cell>
							<Cell>{item.dataHardness?.name}</Cell>
							<Cell>{item.dataParameter?.name}</Cell>
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
			<Modal title={modalTitle} size="6xl" ref={modalRef}>
				<form onSubmit={submit}>
					<fieldset disabled={modalType === 'preview'}>
						<KanbanModalChild reset={reset} control={control} />
					</fieldset>
				</form>
			</Modal>
		</>
	);
}

import {FormEventHandler, useRef} from 'react';

import {useForm} from 'react-hook-form';

import {ModalTypePreview} from '@appTypes/app.type';
import {TMasterItem} from '@appTypes/app.zod';
import {Button, Form, Modal, ModalRef, TableFilter} from '@components';
import {getLayout} from '@hoc';
import {useLoader, useTableFilter} from '@hooks';
import {
	FormType,
	ModalChildMasterItem,
} from '@pageComponent/item/ModalChildMasterItem';
import {modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

MasterItem.getLayout = getLayout;

export default function MasterItem() {
	const modalRef = useRef<ModalRef>(null);

	const {mutateOpts, ...loader} = useLoader();
	const {formValue, hookForm} = useTableFilter();
	const {mutate: mutateUpsert} = trpc.item.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} = trpc.item.delete.useMutation(mutateOpts);
	const {data, refetch} = trpc.item.get.useQuery({
		...formValue,
		withDetail: true,
	});

	const {control, handleSubmit, watch, clearErrors, reset} =
		useForm<FormType>();

	const [modalType] = watch(['type']);
	const {modalTitle, isPreview} = modalTypeParser(modalType);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async ({type, id, ...body}) => {
			switch (type) {
				case 'add':
				case 'edit':
					return mutateUpsert({...body, id}, {onSuccess});
				case 'delete':
					return mutateDelete({id}, {onSuccess});
				default:
					return null;
			}
		})();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(type: ModalTypePreview, initValue: Partial<TMasterItem>) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			{loader.component}
			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<Form
					context={{disabled: isPreview, hideButton: isPreview}}
					onSubmit={submit}
					className="flex flex-col gap-2">
					<ModalChildMasterItem reset={reset} control={control} />
				</Form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<TableFilter
					data={data}
					form={hookForm}
					keyExtractor={item => item.id}
					header={[
						'Nomor',
						'Nama Mesin',
						'Nama Item',
						'Kode Item',
						'Harga',
						'Keterangan',
						'Action',
					]}
					topComponent={
						<Button onClick={() => showModal('add', {})}>Add</Button>
					}
					renderItem={({item, Cell}, index) => {
						const {id, name, kode_item, harga, keterangan} = item;

						return (
							<>
								<Cell>{index + 1}</Cell>
								<Cell>{item.nameMesins.join(', ')}</Cell>
								<Cell>{name}</Cell>
								<Cell>{kode_item}</Cell>
								<Cell>{harga}</Cell>
								<Cell>{keterangan}</Cell>
								<Cell className="flex gap-x-2">
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
			</div>
		</>
	);
}

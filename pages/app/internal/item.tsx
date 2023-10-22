import {FormEventHandler, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SItem} from '@appTypes/app.zod';
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
} from '@components';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import {formParser, modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SItem;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

InternalItem.getLayout = getLayout;

export default function InternalItem() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isPreview, isDelete} = formParser(dataForm, {
		pageName: 'Item',
	});

	const {component, refetch, mutateOpts} = useTableFilterComponentV2({
		reset,
		control,
		useQuery: form => trpc.internal.item.get.useQuery(form),
		header: ['No', 'Nama Supplier', 'Kode Item', 'Nama Item', 'PPN', 'Action'],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		renderItem: ({Cell, item}, index) => {
			const {dSSUp, kode, nama, ppn} = item;
			return (
				<>
					<Cell>{index + 1}</Cell>
					<Cell>{dSSUp.nama}</Cell>
					<Cell>{kode}</Cell>
					<Cell>{nama}</Cell>
					<Cell>{ppn ? 'Ya' : 'Tidak'}</Cell>
					<Cell className="gap-2">
						<Button
							icon="faMagnifyingGlass"
							onClick={() => showModal({type: 'preview', form: item})}
						/>
						<Button
							icon="faEdit"
							onClick={() => showModal({type: 'edit', form: item})}
						/>
						<Button
							icon="faTrash"
							onClick={() => showModal({type: 'delete', form: item})}
						/>
					</Cell>
				</>
			);
		},
	});

	const {mutateAsync: mutateUpsert} =
		trpc.internal.item.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.item.delete.useMutation(mutateOpts);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async value => {
			if (isDelete) mutateDelete({id: value.form.id}, {onSuccess});
			else mutateUpsert(value.form, {onSuccess});

			function onSuccess() {
				refetch();
				modalRef.current?.hide();
			}
		})();
	};

	function showModal({type, ...initValue}: Partial<FormType>) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			{component}
			<Modal title={modalTitle} ref={modalRef}>
				<Form
					context={{hideButton: isPreview, disabled: isPreview}}
					onSubmit={submit}>
					<RenderModal control={control} />
				</Form>
			</Modal>
		</>
	);
}

function RenderModal({control}: FormProps<FormType>) {
	const {type} = useWatch({control});
	const {isDelete} = modalTypeParser(type);
	const {data} = trpc.internal.supplier.get.useQuery({limit: 9999});

	if (isDelete) return <Button type="submit">Hapus</Button>;

	return (
		<div className="flex flex-col gap-2">
			<Select
				control={control}
				fieldName="form.sup_id"
				data={selectMapper(data?.rows ?? [], 'id', 'nama')}
			/>
			<Input control={control} fieldName="form.kode" label="Kode Item" />
			<Input control={control} fieldName="form.nama" label="Nama Item" />
			<Input
				type="checkbox"
				control={control}
				fieldName="form.ppn"
				label="PPN"
			/>
			<Button type="submit">Submit</Button>
		</div>
	);
}

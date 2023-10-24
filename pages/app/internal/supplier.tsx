import {FormEventHandler, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SSupplier} from '@appTypes/app.zod';
import {Button, Form, Input, Modal, ModalRef} from '@components';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import {formParser, modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SSupplier;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

InternalSupplier.getLayout = getLayout;

export default function InternalSupplier() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isPreview, isDelete} = formParser(dataForm, {
		pageName: 'Supplier',
	});

	const {component, refetch, mutateOpts} = useTableFilterComponentV2({
		reset,
		control,
		useQuery: form => trpc.internal.supplier.get.useQuery(form),
		header: ['No', 'Nama', 'Alamat', 'NPWP', 'Action'],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		renderItem: ({Cell, item}, index) => {
			const {alamat, nama, npwp} = item;
			return (
				<>
					<Cell>{index + 1}</Cell>
					<Cell>{nama}</Cell>
					<Cell>{alamat}</Cell>
					<Cell>{npwp}</Cell>
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
		trpc.internal.supplier.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.supplier.delete.useMutation(mutateOpts);

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

	if (isDelete) return <Button type="submit">Hapus</Button>;

	return (
		<div className="flex flex-col gap-2">
			<Input control={control} fieldName="form.nama" label="Nama" />
			<Input control={control} fieldName="form.telp" label="NPWP" />
			<Input control={control} fieldName="form.npwp" label="NPWP" />
			<Input
				multiline
				label="Alamat"
				control={control}
				fieldName="form.alamat"
			/>
			<Button type="submit">Submit</Button>
		</div>
	);
}

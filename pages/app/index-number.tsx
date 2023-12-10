import {FormEventHandler, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypePreview} from '@appTypes/app.type';
import {TIndex, TMasterItem} from '@appTypes/app.zod';
import {Button, Form, Input, Modal, ModalRef, Select} from '@components';
import {selectionIndex} from '@constants';
import {getLayout} from '@hoc';
import {Fields, useTableFilterComponent} from '@hooks';
import {modalTypeParser, nullUseQuery, renderItemAsIs} from '@utils';
import {trpc} from '@utils/trpc';

NumberIndex.getLayout = getLayout;

type FormType = Fields<TIndex>;

export default function NumberIndex() {
	const modalRef = useRef<ModalRef>(null);

	const {control, handleSubmit, watch, clearErrors, reset} =
		useForm<FormType>();

	const {type: modalType} = watch();
	const {modalTitle, isPreview} = modalTypeParser(modalType);

	const {component, mutateOpts, refetch} = useTableFilterComponent({
		control,
		reset,
		exportRenderItem: renderItemAsIs,
		exportUseQuery: nullUseQuery,
		header: ['No', 'Prefix', 'Target', 'Keterangan', 'Action'],
		topComponent: <Button onClick={() => showModal('add', {})}>Add</Button>,
		useQuery: form => trpc.index.get.useQuery(form),
		renderItem: ({item, Cell}, index) => {
			const {id, prefix, target, keterangan} = item;

			return (
				<>
					<Cell>{index + 1}</Cell>
					<Cell>{prefix}</Cell>
					<Cell>{target}</Cell>
					<Cell>{keterangan}</Cell>
					<Cell className="flex gap-x-2">
						<Button onClick={() => showModal('preview', item)}>Preview</Button>
						<Button onClick={() => showModal('edit', item)}>Edit</Button>
						<Button onClick={() => showModal('delete', {id})}>Delete</Button>
					</Cell>
				</>
			);
		},
	});

	const {mutate: mutateUpsert} = trpc.index.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} = trpc.index.delete.useMutation(mutateOpts);

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
			{component}

			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<Form
					context={{disabled: isPreview, hideButton: isPreview}}
					onSubmit={submit}
					className="flex flex-col gap-2">
					<ModalChildMasterItem reset={reset} control={control} />
				</Form>
			</Modal>
		</>
	);
}

function ModalChildMasterItem({
	control,
}: FormProps<FormType, 'control' | 'reset'>) {
	const {type} = useWatch({control});
	const {isDelete} = modalTypeParser(type);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<>
			<Input
				control={control}
				fieldName="prefix"
				placeholderBottom="Contoh: KNB/IMI/{prefix} -> KNB/IMI/0001 atau {prefix}/KNB/IMI -> 0001/KNB/IMI"
			/>
			<Select control={control} fieldName="target" data={selectionIndex} />
			<Input control={control} fieldName="keterangan" />
			<Button type="submit">Submit</Button>;
		</>
	);
}

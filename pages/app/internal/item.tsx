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
import {ppnMultiply, ppnPercentage} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilterComponent} from '@hooks';
import {
	formParser,
	modalTypeParser,
	numberFormat,
	renderItemAsIs,
} from '@utils';
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

	const {modalTitle, isPreview, property, selectedIds, isDelete} = formParser(
		dataForm,
		{
			pageName: 'Item',
			property: 'selectedIds',
		},
	);

	const {component, refetch, mutateOpts} = useTableFilterComponent({
		reset,
		control,
		useQuery: form => trpc.internal.item.get.useQuery(form),
		property,
		enabledExport: true,
		exportRenderItem: renderItemAsIs,
		exportUseQuery: () =>
			trpc.export.internal.item.useQuery({ids: selectedIds}),
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		header: [
			'No',
			'Nama Supplier',
			'Kode Item',
			'Nama Item',
			'Harga',
			'PPn',
			'Action',
		],
		renderItem: ({Cell, CellSelect, item}, index) => {
			const {oSup: dSSUp, kode, nama, harga, ppn} = item;
			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{dSSUp.nama}</Cell>
					<Cell>{kode}</Cell>
					<Cell>{nama}</Cell>
					<Cell>{numberFormat(harga)}</Cell>
					<Cell>{numberFormat(ppn ? harga * ppnMultiply : 0)}</Cell>
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
				label="Supplier"
				control={control}
				fieldName="form.sup_id"
				data={selectMapper(data?.rows ?? [], 'id', 'nama')}
			/>
			<Input control={control} fieldName="form.kode" label="Kode Item" />
			<Input control={control} fieldName="form.nama" label="Nama Item" />

			<div className="flex gap-2">
				<Input
					type="decimal"
					control={control}
					fieldName="form.harga"
					label="Harga"
					className="flex-1"
				/>
				<Input
					type="checkbox"
					control={control}
					fieldName="form.ppn"
					label={`PPn ${ppnPercentage}%`}
				/>
			</div>

			<Button type="submit">Submit</Button>
		</div>
	);
}

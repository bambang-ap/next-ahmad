import {FormEventHandler, Fragment, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SReqForm} from '@appTypes/app.zod';
import {
	Button,
	Form,
	Input,
	InputDummy,
	Modal,
	ModalRef,
	Select,
	Table,
} from '@components';
import {selectReqStatus, selectUnitDataInternal} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import {formParser, generateId, modalTypeParser, renderIndex} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SReqForm;
	type: ModalTypeSelect;
	isEditing?: boolean;
	selectedIds: MyObject<boolean>;
};

InternalRequestForm.getLayout = getLayout;

export default function InternalRequestForm() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {isEditing} = dataForm;
	const {modalTitle, isPreview, isDelete} = formParser(dataForm, {
		pageName: 'Form Permintaan',
		property: 'selectedIds',
	});

	const {component, refetch, mutateOpts} = useTableFilterComponentV2({
		reset,
		control,
		useQuery: form => trpc.internal.request.get.useQuery(form),
		header: ['No', 'Nomor Form', 'Date', 'Due Date', 'Status', 'Action'],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		renderItem: ({Cell, CellSelect, item}, index) => {
			const {date, due_date, status} = item;

			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{renderIndex(item)}</Cell>
					<Cell>{date}</Cell>
					<Cell>{due_date}</Cell>
					<Cell>{status}</Cell>
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
							icon="faList"
							onClick={() =>
								showModal({type: 'edit', isEditing: true, form: item})
							}
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
		trpc.internal.request.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.request.delete.useMutation(mutateOpts);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async value => {
			if (isDelete) mutateDelete({id: value.form.id!}, {onSuccess});
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
			<Modal size="lg" title={modalTitle} ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{hideButton: isPreview, disabled: isPreview || isEditing}}>
					<RenderModal control={control} reset={reset} />
				</Form>
			</Modal>
		</>
	);
}

function RenderModal({
	control,
	reset,
}: FormProps<FormType, 'control' | 'reset'>) {
	const {type, isEditing, form} = useWatch({control});
	const {isDelete, isPreviewEdit} = modalTypeParser(type);

	if (isDelete) return <Button type="submit">Hapus</Button>;

	function addItem() {
		reset(prev => {
			const oItems = prev.form.items?.slice?.() ?? [];
			oItems.push({id: generateId()} as typeof oItems[number]);
			return {...prev, form: {...prev.form, items: oItems}};
		});
	}

	function removeItem(id: string) {
		reset(prev => {
			const oItems = prev.form.items?.slice?.() ?? [];
			const index = oItems.findIndex(e => e.id === id);

			return {...prev, form: {...prev.form, items: oItems.remove(index)}};
		});
	}

	return (
		<div className="flex flex-col gap-2">
			<Input hidden control={control} fieldName="form.status" />
			{isPreviewEdit && (
				<InputDummy
					disabled
					className="flex-1"
					label="Nomor Form"
					byPassValue={renderIndex(form!)}
				/>
			)}
			<Input type="date" control={control} fieldName="form.date" label="Date" />
			<Input
				type="date"
				control={control}
				fieldName="form.due_date"
				label="Due Date"
			/>

			{isEditing && (
				<>
					<Select
						forceEditable
						label="Status"
						control={control}
						fieldName="form.status"
						data={selectReqStatus}
					/>
					<Input
						multiline
						forceEditable
						control={control}
						label="Keterangan"
						fieldName="form.keterangan"
					/>
				</>
			)}

			<Table
				topComponent={
					!isEditing && (
						<Button className="w-full" onClick={addItem}>
							Tambah Item
						</Button>
					)
				}
				data={form?.items}
				renderItem={({Cell, item}, i) => {
					const idItem = item.id;

					return (
						<Fragment key={idItem}>
							<Cell>
								<Input
									control={control}
									className="flex-1"
									label="Nama Item"
									fieldName={`form.items.${i}.name`}
								/>
							</Cell>
							<Cell>
								<Input
									control={control}
									className="flex-1"
									label="Kode Item"
									fieldName={`form.items.${i}.code`}
								/>
							</Cell>
							<Cell className="gap-2">
								<Input
									type="decimal"
									className="flex-1"
									label="Jumlah"
									control={control}
									fieldName={`form.items.${i}.qty`}
								/>
								<Select
									label="Unit"
									className="flex-1"
									control={control}
									data={selectUnitDataInternal}
									fieldName={`form.items.${i}.unit`}
								/>
							</Cell>

							<Cell className="gap-2">
								<Input
									className="flex-1"
									label="Keterangan"
									control={control}
									fieldName={`form.items.${i}.keterangan`}
								/>
							</Cell>

							{!isEditing && (
								<Cell>
									<Button icon="faTrash" onClick={() => removeItem(idItem!)} />
								</Cell>
							)}
						</Fragment>
					);
				}}
			/>

			<Button type="submit">Submit</Button>
		</div>
	);
}

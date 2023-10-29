import {FormEventHandler, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SOutBarang} from '@appTypes/app.zod';
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapperV2,
	Text,
} from '@components';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import {dateUtils, formParser, modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SOutBarang;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

OutBarang.getLayout = getLayout;

export default function OutBarang() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isPreview, isDelete} = formParser(dataForm, {
		pageName: 'Form Barang Keluar',
		property: 'selectedIds',
	});

	const {component, refetch, mutateOpts} = useTableFilterComponentV2({
		reset,
		control,
		useQuery: formdd => trpc.internal.out.get.useQuery(formdd),
		header: ['No', 'Date', 'Qty', 'Keterangan', 'Action'],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		renderItem: ({Cell, CellSelect, item}, index) => {
			const {qty, createdAt, oStock, keterangan} = item;

			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{dateUtils.full(createdAt)}</Cell>
					<Cell>
						{qty} {oStock.unit}
					</Cell>
					<Cell>{keterangan}</Cell>
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
		trpc.internal.out.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.out.delete.useMutation(mutateOpts);

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
			<Modal title={modalTitle} ref={modalRef}>
				<Form
					context={{hideButton: isPreview, disabled: isPreview}}
					onSubmit={submit}>
					<RenderModal control={control} reset={reset} />
				</Form>
			</Modal>
		</>
	);
}

function RenderModal({control}: FormProps<FormType, 'control' | 'reset'>) {
	const {type, form} = useWatch({control});
	const {isDelete} = modalTypeParser(type);

	const {data} = trpc.internal.stock.get.useQuery({limit: 9999});

	if (isDelete) return <Button type="submit">Hapus</Button>;

	const itemSelected = data?.rows.find(e => e.id === form?.id_stock);

	return (
		<div className="flex flex-col gap-2">
			<Select
				key={`${!!data}`}
				control={control}
				fieldName="form.id_stock"
				label="Item"
				data={selectMapperV2(
					data?.rows.filter(e => e.id === form?.id_stock || !e.isClosed) ?? [],
					'id',
					{
						labels: ['oItem.nama', 'oSup.nama'],
					},
				)}
			/>

			{!!itemSelected && (
				<Input
					label="Qty"
					type="decimal"
					control={control}
					fieldName="form.qty"
					key={`${!!data}${itemSelected.id}`}
					rightAcc={<Text>{itemSelected?.unit}</Text>}
					defaultValue={itemSelected.qty - itemSelected.usedQty}
				/>
			)}

			<Input
				multiline
				control={control}
				fieldName="form.keterangan"
				label="Keterangan"
			/>

			<Button type="submit">Submit</Button>
		</div>
	);
}

import {FormEventHandler, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SStock} from '@appTypes/app.zod';
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
} from '@components';
import {selectUnitData} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import {formParser, modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SStock;
	isSelection: boolean;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

InternalStock.getLayout = getLayout;

export default function InternalStock() {
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
		useQuery: form => trpc.internal.stock.get.useQuery(form),
		header: [
			'No',
			'Nama Supplier',
			'Kode Item',
			'Nama Item',
			'Harga',
			'Qty',
			'PPn',
			'Action',
		],
		topComponent: (
			<>
				<Button onClick={() => showModal({type: 'add', isSelection: true})}>
					Selection Add
				</Button>
				<Button onClick={() => showModal({type: 'add'})}>Manual Add</Button>
			</>
		),
		renderItem: ({Cell, item}, index) => {
			const {oSup: dSSUp, kode, nama, harga, ppn, qty, unit, oItem} = item;

			const isPPn = typeof oItem?.ppn === 'boolean' ? oItem?.ppn : ppn;

			return (
				<>
					<Cell>{index + 1}</Cell>
					<Cell>{dSSUp.nama}</Cell>
					<Cell>{oItem?.kode ?? kode}</Cell>
					<Cell>{oItem?.nama ?? nama}</Cell>
					<Cell>{oItem?.harga ?? harga}</Cell>
					<Cell>{`${qty} ${unit}`}</Cell>
					<Cell>{isPPn ? 'Ya' : 'Tidak'}</Cell>
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
		trpc.internal.stock.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.stock.delete.useMutation(mutateOpts);

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
	const {type, form, isSelection: selection} = useWatch({control});
	const {isDelete} = modalTypeParser(type);
	const {data: dataSup} = trpc.internal.supplier.get.useQuery({limit: 9999});
	const {data: dataItem} = trpc.internal.item.get.useQuery(
		{limit: 9999, id: form?.sup_id},
		{enabled: !!form?.sup_id},
	);

	if (isDelete) return <Button type="submit">Hapus</Button>;

	const isSelection = selection || !!form?.id_item;
	const itemSelections = selectMapper(dataItem?.rows ?? [], 'id', 'nama');
	const item = dataItem?.rows?.find(e => e.id === form?.id_item);
	const {keyItem, keySup} = {
		keySup: `${form?.sup_id}${!!dataSup}`,
		get keyItem() {
			return `${this.keySup}${!!dataItem}${form?.id_item}`;
		},
	};

	return (
		<div className="flex flex-col gap-2">
			<Select
				key={keySup}
				label="Supplier"
				control={control}
				fieldName="form.sup_id"
				data={selectMapper(dataSup?.rows ?? [], 'id', 'nama')}
			/>

			{isSelection ? (
				<Select
					key={keyItem}
					control={control}
					label="Nama Item"
					className="flex-1"
					data={itemSelections}
					fieldName="form.id_item"
				/>
			) : (
				<Input control={control} fieldName="form.nama" label="Nama Item" />
			)}

			<Input
				disabled={isSelection}
				control={control}
				label="Kode Item"
				fieldName="form.kode"
				byPassValue={item?.kode}
			/>

			<div className="flex gap-2">
				<Input
					disabled={isSelection}
					byPassValue={item?.harga}
					type="decimal"
					control={control}
					fieldName="form.harga"
					label="Harga"
					className="flex-1"
				/>
				<Input
					disabled={isSelection}
					byPassValue={item?.ppn}
					type="checkbox"
					control={control}
					fieldName="form.ppn"
					label="PPn"
				/>
			</div>

			<div className="flex gap-2">
				<Input
					className="flex-1"
					control={control}
					fieldName="form.qty"
					label="Qty"
				/>
				<Select
					className="flex-1"
					label="Unit"
					control={control}
					fieldName="form.unit"
					data={selectUnitData}
				/>
			</div>

			<Button type="submit">Submit</Button>
		</div>
	);
}

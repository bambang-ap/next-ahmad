import {FormEventHandler, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Table,
} from '@components';
import {ppnMultiply, selectUnitDataInternal} from '@constants';
import {getLayout} from '@hoc';
import {useSession, useTableFilterComponent} from '@hooks';
import type {RetStock} from '@trpc/routers/internal/stockRouters';
import {
	dateUtils,
	formParser,
	modalTypeParser,
	numberFormat,
	renderItemAsIs,
} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: RetStock;
	isSelection: boolean;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

InternalStock.getLayout = getLayout;

export default function InternalStock() {
	const {isAdmin} = useSession();
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isOther, isPreview, isDelete, property, selectedIds} =
		formParser(dataForm, {pageName: 'Stock', property: 'selectedIds'});

	const {component, refetch, mutateOpts} = useTableFilterComponent({
		reset,
		control,
		property,
		enabledExport: true,
		exportRenderItem: renderItemAsIs,
		header: [
			'No',
			'Suplier',
			'Kode Item',
			'Nama Item',
			'Harga',
			'PPn',
			'Qty Masuk',
			'Qty Stock',
			'Qty Keluar',
			'Action',
		],
		useQuery: form => trpc.internal.stock.get.useQuery(form),
		exportUseQuery: () =>
			trpc.export.internal.stock.useQuery({ids: selectedIds}),
		topComponent: (
			<>
				<Button onClick={() => showModal({type: 'add', isSelection: true})}>
					Tambah Stok Suplier
				</Button>
				<Button onClick={() => showModal({type: 'add'})}>
					Tambah Stok Non Suplier
				</Button>
			</>
		),
		renderItem: ({Cell, CellSelect, item}, index) => {
			const {
				oSup: dSSUp,
				kode,
				nama,
				harga,
				ppn,
				qty,
				unit,
				oItem,
				usedQty,
			} = item;

			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{dSSUp?.nama}</Cell>
					<Cell>{oItem?.kode ?? kode}</Cell>
					<Cell>{oItem?.nama ?? nama}</Cell>
					<Cell>{numberFormat(oItem?.harga ?? harga)}</Cell>
					<Cell>
						{numberFormat(
							oItem?.ppn || ppn ? (oItem?.harga ?? harga) * ppnMultiply : 0,
						)}
					</Cell>
					<Cell>{`${qty} ${unit}`}</Cell>
					<Cell>{`${qty - usedQty} ${unit}`}</Cell>
					<Cell>{`${usedQty} ${unit}`}</Cell>
					<Cell className="gap-2">
						<Button
							icon="faMagnifyingGlass"
							onClick={() => showModal({type: 'preview', form: item})}
						/>
						<Button
							icon="faHistory"
							onClick={() => showModal({type: 'other', form: item})}
						/>
						{/* <Button
							icon="faEdit"
							onClick={() => showModal({type: 'edit', form: item})}
						/> */}
						{isAdmin && (
							<Button
								icon="faTrash"
								onClick={() => showModal({type: 'delete', form: item})}
							/>
						)}
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
			<Modal title={isOther ? 'Qty Story' : modalTitle} ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{hideButton: isPreview, disabled: isPreview}}>
					<RenderModal control={control} />
				</Form>
			</Modal>
		</>
	);
}

function QtyHistory({control}: FormProps<FormType>) {
	const {form} = useWatch({control});

	const {unit, oOuts} = form ?? {};

	return (
		<Table
			data={oOuts}
			renderItem={({Cell, item}) => {
				const {qty, createdAt, keterangan} = item ?? {};

				return (
					<>
						<Cell className="flex-1" width="35%">
							{dateUtils.full(createdAt)}
						</Cell>
						<Cell className="flex-1" width="15%">
							{qty} {unit}
						</Cell>
						<Cell className="flex-1" width="50%">
							{keterangan}
						</Cell>
					</>
				);
			}}
		/>
	);
}

function RenderModal({control}: FormProps<FormType>) {
	const {type, form, isSelection: selection} = useWatch({control});
	const {isDelete, isOther} = modalTypeParser(type);
	const {data: dataSup} = trpc.internal.supplier.get.useQuery({limit: 9999});
	const {data: dataItem} = trpc.internal.item.get.useQuery(
		{limit: 9999, id: form?.sup_id},
		{enabled: !!form?.sup_id},
	);

	if (isOther) return <QtyHistory control={control} />;

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
					data={selectUnitDataInternal}
				/>
			</div>

			<Button type="submit">Submit</Button>
		</div>
	);
}

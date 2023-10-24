import {FormEventHandler, Fragment, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SPoUpsert} from '@appTypes/app.zod';
import {
	BorderTd,
	Button,
	Form,
	Input,
	InputDummy,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Table,
} from '@components';
import {selectUnitData} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import {formParser, modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SPoUpsert;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

InternalPo.getLayout = getLayout;

export default function InternalPo() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isPreview, isDelete, selectedIds, property} = formParser(
		dataForm,
		{
			pageName: 'PO',
			property: 'selectedIds',
		},
	);

	const {component, refetch, mutateOpts} = useTableFilterComponentV2({
		reset,
		control,
		// property,
		genPdfOptions: {
			tagId: 'fgh',
			renderItem: item => <></>,
			useQuery: () => trpc.internal.po.export.useQuery({ids: selectedIds}),
		},
		useQuery: form => trpc.internal.po.get.useQuery(form),
		header: ['No', 'Nama Supplier', 'Nomor PO', 'Date', 'Due Date', 'Action'],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		renderItem: ({Cell, CellSelect, item}, index) => {
			const {oSup: dSSUp, date, due_date, nomor_po} = item;
			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{dSSUp?.nama}</Cell>
					<Cell>{nomor_po}</Cell>
					<Cell>{date}</Cell>
					<Cell>{due_date}</Cell>
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
		trpc.internal.po.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.po.delete.useMutation(mutateOpts);

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
			{/* <RenderPdf /> */}
			<Modal size="lg" title={modalTitle} ref={modalRef}>
				<Form
					context={{hideButton: isPreview, disabled: isPreview}}
					onSubmit={submit}>
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
	const {type, form} = useWatch({control});
	const {isDelete, isEdit} = modalTypeParser(type);
	const {data: dataSup} = trpc.internal.supplier.get.useQuery({
		limit: 9999,
	});
	const {data: dataItem} = trpc.internal.item.get.useQuery(
		{limit: 9999, id: form?.sup_id},
		{enabled: !!form?.sup_id},
	);

	if (isDelete) return <Button type="submit">Hapus</Button>;

	const keySup = `${!!dataSup}${form?.sup_id}`;
	const selectedItems =
		form?.oPoItems?.map(e => e.id_item).filter(Boolean) ?? [];

	function addItem() {
		reset(prev => {
			const oItems = prev.form.oPoItems?.slice?.() ?? [];
			oItems.push({temp_id: uuid()} as typeof oItems[number]);
			return {...prev, form: {...prev.form, oPoItems: oItems}};
		});
	}

	function removeItem(id: string) {
		reset(prev => {
			const oItems = prev.form.oPoItems?.slice?.() ?? [];
			const index = oItems.findIndex(e => e.id === id || e.temp_id === id);

			return {
				...prev,
				form: {...prev.form, oPoItems: oItems.remove(index)},
			};
		});
	}

	return (
		<div className="flex flex-col gap-2">
			<Select
				key={keySup}
				label="Supplier"
				disabled={isEdit}
				control={control}
				fieldName="form.sup_id"
				data={selectMapper(dataSup?.rows ?? [], 'id', 'nama')}
			/>
			<Input control={control} fieldName="form.nomor_po" label="Nomor PO" />
			<Input type="date" control={control} fieldName="form.date" label="Date" />
			<Input
				type="date"
				control={control}
				fieldName="form.due_date"
				label="Due Date"
			/>

			<Table
				topComponent={
					<Button className="w-full" onClick={addItem}>
						Tambah Item
					</Button>
				}
				data={form?.oPoItems}
				renderItem={({Cell, item}, i) => {
					const idItem = item.id ?? item.temp_id!;
					const oItem =
						item.oItem ?? dataItem?.rows.find(e => e.id === item.id_item);
					const keyItem = `${keySup}${!!dataItem}${!!oItem}${idItem}`;

					const itemSelections = selectMapper(
						dataItem?.rows ?? [],
						'id',
						'kode',
					).filter(
						e => e.value === item.id_item || !selectedItems.includes(e.value),
					);

					return (
						<Fragment key={idItem}>
							<Input
								hidden
								control={control}
								fieldName={`form.oPoItems.${i}.qty`}
							/>
							<Cell width="30%">
								<Select
									key={keyItem}
									disabled={isEdit}
									control={control}
									label="Kode Item"
									className="flex-1"
									data={itemSelections}
									fieldName={`form.oPoItems.${i}.id_item`}
								/>
							</Cell>
							<Cell>
								<InputDummy
									className="flex-1"
									label="Nama Item"
									byPassValue={oItem?.nama}
									disabled
								/>
							</Cell>
							<Cell>
								<InputDummy
									className="flex-1"
									label="Harga"
									type="decimal"
									byPassValue={oItem?.harga}
									disabled
								/>
							</Cell>
							<Cell className="gap-2">
								<Input
									type="decimal"
									className="flex-1"
									label="Jumlah"
									control={control}
									fieldName={`form.oPoItems.${i}.qty`}
								/>
								<Select
									label="Unit"
									className="flex-1"
									control={control}
									data={selectUnitData}
									fieldName={`form.oPoItems.${i}.unit`}
								/>
							</Cell>

							<Cell>
								<Button icon="faTrash" onClick={() => removeItem(idItem)} />
							</Cell>
						</Fragment>
					);
				}}
			/>

			<Button type="submit">Submit</Button>
		</div>
	);
}

function RenderPdf() {
	return (
		<>
			<table className="w-full">
				<tr>
					<BorderTd row className="flex-1">
						<div>IMI</div>
						<div>PT. Indoheat Metal Inti</div>
					</BorderTd>
					<BorderTd className="flex-1">Purchase Order</BorderTd>
					<BorderTd row className="flex-1">
						<div>Tanggal Efektif</div>
						<div>01/01/2011</div>
					</BorderTd>
				</tr>
			</table>
		</>
	);
}

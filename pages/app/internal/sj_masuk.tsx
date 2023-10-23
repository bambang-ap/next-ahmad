import {FormEventHandler, Fragment, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SPoUpsert} from '@appTypes/app.zod';
import {
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

InternalSiIn.getLayout = getLayout;

export default function InternalSiIn() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isPreview, isDelete} = formParser(dataForm, {
		pageName: 'PO',
	});

	const {component, refetch, mutateOpts} = useTableFilterComponentV2({
		reset,
		control,
		useQuery: form => trpc.internal.in.get.useQuery(form),
		header: ['No', 'Nama Supplier', 'Date', 'Due Date', 'Action'],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		renderItem: ({Cell, item}, index) => {
			const {oSup: dSSUp, date, due_date} = item;
			return (
				<>
					<Cell>{index + 1}</Cell>
					<Cell>{dSSUp?.nama}</Cell>
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
		trpc.internal.in.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.in.delete.useMutation(mutateOpts);

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
	const {isDelete} = modalTypeParser(type);
	const {data: dataSupplier} = trpc.internal.supplier.get.useQuery({
		limit: 9999,
	});
	const {data: dataItem} = trpc.internal.item.get.useQuery(
		{limit: 9999, id: form?.sup_id},
		{enabled: !!form?.sup_id},
	);

	if (isDelete) return <Button type="submit">Hapus</Button>;

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
				label="Supplier"
				control={control}
				fieldName="form.sup_id"
				data={selectMapper(dataSupplier?.rows ?? [], 'id', 'nama')}
			/>
			<Input
				type="date"
				control={control}
				fieldName="form.date"
				label="Kode Item"
			/>
			<Input
				type="date"
				control={control}
				fieldName="form.due_date"
				label="Nama Item"
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
									className="flex-1"
									label="Kode Item"
									control={control}
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
import {FormEventHandler, Fragment, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SInUpsert} from '@appTypes/app.zod';
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
	Text,
} from '@components';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import {formParser, modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SInUpsert;
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
		header: ['No', 'Nama Supplier', 'Nomor PO', 'Date', 'Action'],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		renderItem: ({Cell, item}, index) => {
			const {date, oPo} = item;
			return (
				<>
					<Cell>{index + 1}</Cell>
					<Cell>{oPo?.oSup?.nama}</Cell>
					<Cell>{oPo?.nomor_po}</Cell>
					<Cell>{date}</Cell>
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

	const {data: dataSup} = trpc.internal.supplier.get.useQuery({
		limit: 9999,
	});
	const {data: dataPo} = trpc.internal.po.get.useQuery(
		{limit: 9999, id: form?.sup_id},
		{enabled: !!form?.sup_id},
	);
	const {data: poItems} = trpc.internal.in.get_closed.useQuery(
		{id: form?.id_po!},
		{enabled: !!form?.id_po},
	);

	const {isDelete, isEdit} = modalTypeParser(type);

	if (isDelete) return <Button type="submit">Hapus</Button>;

	const selectedPo = dataPo?.rows.find(e => e.id === form?.id_po);
	const selectedItems = form?.oInItems;
	const selectedIdItems =
		selectedItems?.map(e => e.id_item).filter(Boolean) ?? [];

	const {keyPo, keySup} = {
		keySup: `${!!dataSup}${form?.sup_id}`,
		get keyPo() {
			return `${this.keySup}${!!selectedPo}${form?.id_po}`;
		},
	};

	function addItem() {
		reset(prev => {
			const oInItems = prev.form.oInItems?.slice?.() ?? [];
			oInItems.push({temp_id: uuid()} as typeof oInItems[number]);
			return {...prev, form: {...prev.form, oInItems}};
		});
	}

	function removeItem(id: string) {
		reset(prev => {
			const oItems = prev.form.oInItems?.slice?.() ?? [];
			const index = oItems.findIndex(e => e.id === id || e.temp_id === id);

			return {
				...prev,
				form: {...prev.form, oInItems: oItems.remove(index)},
			};
		});
	}

	return (
		<div className="flex flex-col gap-2">
			<Select
				key={keySup}
				label="Supplier"
				control={control}
				fieldName="form.sup_id"
				data={selectMapper(dataSup?.rows ?? [], 'id', 'nama')}
			/>

			<Select
				key={keyPo}
				label="PO"
				control={control}
				fieldName="form.id_po"
				data={selectMapper(dataPo?.rows ?? [], 'id', 'nomor_po')}
			/>

			<Input type="date" control={control} fieldName="form.date" label="Date" />

			<Table
				topComponent={
					<Button className="w-full" onClick={addItem}>
						Tambah Item
					</Button>
				}
				data={form?.oInItems}
				renderItem={({Cell, item}, i) => {
					const idItem = item.id ?? item.temp_id!;
					const poItem = selectedPo?.oPoItems.find(e => e.id === item.id_item);
					const selPoItem = poItems?.find(e => e.id === poItem?.id);
					const inItem = selPoItem?.oInItems.find(e => e.id === idItem);
					const oItem = poItem?.oItem;
					const keyItem = `${keyPo}${!!poItem}${idItem}`;

					const itemSelections = selectMapper(
						selectedPo?.oPoItems ?? [],
						'id',
						'oItem.nama',
					).filter(
						e => e.value === item.id_item || !selectedIdItems.includes(e.value),
					);

					const defaultValue = selPoItem?.max;
					const max = isEdit ? defaultValue! + inItem?.qty! : defaultValue;

					return (
						<Fragment key={idItem}>
							<Input
								hidden
								control={control}
								fieldName={`form.oInItems.${i}.qty`}
							/>
							<Cell width="30%">
								<Select
									key={keyItem}
									className="flex-1"
									label="Nama Item"
									control={control}
									data={itemSelections}
									fieldName={`form.oInItems.${i}.id_item`}
								/>
							</Cell>
							<Cell>
								<InputDummy
									className="flex-1"
									label="Kode Item"
									byPassValue={oItem?.kode}
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
									defaultValue={defaultValue}
									fieldName={`form.oInItems.${i}.qty`}
									rightAcc={<Text>{poItem?.unit}</Text>}
									rules={{max: {value: max!, message: `Max is ${max}`}}}
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

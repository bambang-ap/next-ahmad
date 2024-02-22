import {FormEventHandler, useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {RouterOutput} from '@appTypes/app.type';
import {ModalTypeSelect, TSupplierItemUpsert} from '@appTypes/app.zod';
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	TableFilterV2,
	TableFilterV2Ref,
} from '@components';
import {getLayout} from '@hoc';
import {useLoader} from '@hooks';
import {modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

type SupplierItemForm = TSupplierItemUpsert & {type: ModalTypeSelect};

ItemSupplier.getLayout = getLayout;

export default function ItemSupplier() {
	const modalRef = useRef<ModalRef>(null);
	const tableRef = useRef<TableFilterV2Ref>(null);

	const {mutateOpts, ...loader} = useLoader();
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<SupplierItemForm>();
	const {mutate: mutateUpsert} =
		trpc.supplier.item.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} =
		trpc.supplier.item.delete.useMutation(mutateOpts);

	const modalForm = watch();

	const {isPreview, isSelect, modalTitle} = modalTypeParser(
		modalForm.type,
		'Item Supplier',
	);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, supplier = [], ...rest}) => {
			switch (type) {
				case 'add':
				case 'edit':
					return mutateUpsert({...rest, supplier}, {onSuccess});
				case 'delete':
					return mutateDelete({id: rest.id}, {onSuccess});
				default:
					return null;
			}
		})();

		function onSuccess() {
			modalRef.current?.hide();
			tableRef.current?.refetch();
		}
	};

	function showModal(
		type: ModalTypeSelect,
		initValue?: Partial<Omit<SupplierItemForm, 'type'>>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			{loader.component}
			<TableFilterV2<RouterOutput['supplier']['item']['get']['rows'][number]>
				ref={tableRef}
				header={['Supplier', 'Kode Item', 'Nama Item', 'Action']}
				useQuery={form => trpc.supplier.item.get.useQuery(form)}
				topComponent={
					isSelect ? (
						<>
							{/* <Button onClick={() => printData(true)}>Print</Button>
							<Button onClick={() => exportData()}>Export</Button> */}
							<Button
								onClick={() =>
									reset(prev => ({...prev, type: undefined, idKanbans: {}}))
								}>
								Batal
							</Button>
						</>
					) : (
						<>
							{/* <Button
								onClick={() => reset(prev => ({...prev, type: "select"}))}>
								Select
							</Button> */}
							<Button onClick={() => showModal('add', {})}>Add</Button>
						</>
					)
				}
				renderItem={({item, Cell}) => {
					const {OrmSuppliers: Supplier, ...restItem} = item;
					const rest: TSupplierItemUpsert = {
						...restItem,
						supplier: Supplier.map(e => e.id),
					};

					return (
						<>
							<Cell>{Supplier.map(sup => sup.name).join(' | ')}</Cell>
							<Cell>{restItem.code_item}</Cell>
							<Cell>{restItem.name_item}</Cell>
							<Cell className="gap-2">
								<Button
									icon="faMagnifyingGlass"
									onClick={() => showModal('preview', rest)}
								/>
								<Button onClick={() => showModal('edit', rest)} icon="faEdit" />
								<Button
									onClick={() => showModal('delete', {id: item.id})}
									icon="faTrash"
								/>
							</Cell>
						</>
					);
				}}
			/>
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form
					onSubmit={submit}
					className="flex flex-col gap-2"
					context={{disabled: isPreview, hideButton: isPreview}}>
					<ModalChildSupItem control={control} />
				</Form>
			</Modal>
		</>
	);
}

function ModalChildSupItem({control}: {control: Control<SupplierItemForm>}) {
	const {data} = trpc.supplier.get.useQuery({withItem: false, limit: 99999});

	const {type} = useWatch({control});
	const {isDelete} = modalTypeParser(type);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<>
			<Select
				multiple
				label="Supplier"
				control={control}
				fieldName="supplier"
				data={selectMapper(data?.rows ?? [], 'id', 'name')}
			/>
			<Input label="Kode Item" control={control} fieldName="code_item" />
			<Input label="Nama Item" control={control} fieldName="name_item" />
			<Button type="submit">Submit</Button>
		</>
	);
}

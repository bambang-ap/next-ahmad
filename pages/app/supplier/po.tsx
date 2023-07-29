import {FormEventHandler, useEffect, useRef} from "react";

import {Control, useForm, UseFormReset, useWatch} from "react-hook-form";

import {
	ModalTypePreview,
	TSupplier,
	TSupplierItem,
	TSupplierPO,
} from "@appTypes/app.type";
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Table,
	TableFilter,
} from "@components";
import {CRUD_ENABLED} from "@enum";
import {getLayout} from "@hoc";
import {useTableFilter} from "@hooks";
import {selectUnitData} from "@pageComponent/ModalChild_po";
import {classNames, modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

POSupplier.getLayout = getLayout;

type FormType = TSupplierPO & {type: ModalTypePreview; tempIdItem: string};
type ModalChildProps = {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
};

export default function POSupplier() {
	const modalRef = useRef<ModalRef>(null);

	const {formValue, hookForm} = useTableFilter();
	const {data} = trpc.supplier.po.get.useQuery(formValue);
	const {mutate: mutateUpsert} = trpc.supplier.po.upsert.useMutation();
	const {mutate: mutateDelete} = trpc.supplier.po.delete.useMutation();

	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const {type: modalType} = watch();

	const {modalTitle, isPreview} = modalTypeParser(modalType, "PO Supplier");

	const submit: FormEventHandler<HTMLFormElement> = e => {
		clearErrors();
		e.preventDefault();
		handleSubmit(({type, ...body}) => {
			switch (type) {
				case "delete":
					return mutateDelete(body.id);
				case "add":
				case "edit":
					return mutateUpsert(body);
				default:
					return;
			}
		})();
	};

	function showModal(form: Partial<FormType>) {
		modalRef.current?.show();
		reset(form);
	}

	return (
		<>
			<Modal
				ref={modalRef}
				title={modalTitle}
				onVisibleChange={visible => {
					if (!visible) reset({});
				}}>
				<Form
					onSubmit={submit}
					className="gap-2 flex flex-col"
					context={{disabled: isPreview, hideButton: isPreview}}>
					<ModalChildPOSupplier control={control} reset={reset} />
				</Form>
			</Modal>

			<TableFilter
				data={data}
				form={hookForm}
				keyExtractor={item => item.id}
				header={["Nama Supplier", "Items", "Action"]}
				topComponent={
					<Button onClick={() => showModal({type: "add"})}>Add</Button>
				}
				renderItem={({Cell, item}) => {
					const {OrmItem, OrmSupplier, items, id} = item;
					return (
						<>
							<Cell>{OrmSupplier.name}</Cell>
							<Cell>
								<Table
									data={Object.entries(items)}
									renderItem={({item: [id_item, dataItem]}) => {
										const selectedItem = OrmItem[id_item];
										return (
											<div className="flex gap-2" key={id_item}>
												<Cell>{selectedItem?.code_item}</Cell>
												<Cell>{selectedItem?.name_item}</Cell>
												<Cell>{selectedItem?.harga}</Cell>
												<Cell>{dataItem.qty}</Cell>
												<Cell>{dataItem.unit}</Cell>
												<Cell>{dataItem.qty * (selectedItem?.harga ?? 0)}</Cell>
											</div>
										);
									}}
								/>
							</Cell>
							<Cell className="flex gap-2">
								<Button
									icon="faMagnifyingGlass"
									onClick={() => showModal({type: "preview", ...item})}
								/>
								<Button
									icon="faEdit"
									onClick={() => showModal({type: "edit", ...item})}
								/>
								<Button
									icon="faTrash"
									onClick={() => showModal({type: "delete", id})}
								/>
							</Cell>
						</>
					);
				}}
			/>
		</>
	);
}

function ModalChildPOSupplier({control, reset}: ModalChildProps) {
	const formData = useWatch({control});

	const {data: dataSupplier = []} = trpc.basic.get.useQuery<any, TSupplier[]>({
		target: CRUD_ENABLED.SUPPLIER,
	});
	const {data: dataItem = []} = trpc.basic.get.useQuery<any, TSupplierItem[]>({
		target: CRUD_ENABLED.SUPPLIER_ITEM,
		where: {id_supplier: formData.id_supplier} as Partial<TSupplierItem>,
	});

	const {isDelete, isPreview} = modalTypeParser(formData.type);

	const selectedItems = dataItem.reduce((ret, item) => {
		return {...ret, [item.id]: item};
	}, {} as MyObject<TSupplierItem>);

	function removeItem(id_item: string) {
		reset(prev => {
			const {items} = prev;
			delete items[id_item];
			return {...prev, items};
		});
	}

	useEffect(() => {
		reset(prev => {
			if (!formData.tempIdItem) return prev;
			return {
				...prev,
				tempIdItem: "",
				items: {...prev.items, [formData.tempIdItem]: {qty: 0, unit: ""}},
			};
		});
	}, [formData.tempIdItem]);

	if (isDelete) return <Button type="submit">Delete</Button>;

	return (
		<>
			<div className="flex gap-2">
				<Select
					className="flex-1"
					control={control}
					fieldName="id_supplier"
					data={selectMapper(dataSupplier, "id", "name")}
				/>
				<Select
					control={control}
					fieldName="tempIdItem"
					key={formData.tempIdItem}
					className={classNames("flex-1", {
						hidden: !formData.id_supplier || isPreview,
					})}
					data={selectMapper(dataItem, "id", "code_item").filter(
						data => !Object.keys(formData.items ?? {}).includes(data.value),
					)}
				/>
			</div>

			<Table
				data={Object.entries(formData.items ?? {})}
				header={["Nama", "Harga", "Jumlah", "Total", "∂"]}
				className={classNames({
					hidden: Object.keys(formData.items ?? {}).length <= 0,
				})}
				renderItem={({item: [id_item, item], Cell}) => {
					const selectedItem = selectedItems[id_item];

					return (
						<>
							<Cell>{selectedItem?.name_item}</Cell>
							<Cell>{selectedItem?.harga}</Cell>
							<Cell className="flex gap-2">
								<Input
									type="decimal"
									fieldName={`items.${id_item}.qty`}
									className="flex-1"
									control={control}
								/>
								<Select
									control={control}
									fieldName={`items.${id_item}.unit`}
									data={selectUnitData}
								/>
							</Cell>
							<Cell>{(selectedItem?.harga ?? 0) * (item?.qty ?? 0)}</Cell>
							<Cell>
								<Button onClick={() => removeItem(id_item)} icon="faTrash" />
							</Cell>
						</>
					);
				}}
			/>

			<Button type="submit">Submit</Button>
		</>
	);
}

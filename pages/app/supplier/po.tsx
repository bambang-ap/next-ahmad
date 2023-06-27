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
} from "@components";
import {CRUD_ENABLED} from "@enum";
import {getLayout} from "@hoc";
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

	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const {type: modalType} = watch();

	const {modalTitle} = modalTypeParser(modalType, "PO Supplier");

	const submit: FormEventHandler<HTMLFormElement> = e => {
		clearErrors();
		e.preventDefault();
		handleSubmit(values => {})();
	};

	function showModal({type, ...form}: Partial<FormType>) {
		modalRef.current?.show();
	}

	return (
		<>
			<Button onClick={() => showModal({type: "add"})}>Add</Button>

			<Modal
				visible
				ref={modalRef}
				title={modalTitle}
				onVisibleChange={visible => {
					if (!visible) reset({});
				}}>
				<Form onSubmit={submit} className="gap-2 flex flex-col">
					<ModalChildPOSupplier control={control} reset={reset} />
					<Button>Submit</Button>
				</Form>
			</Modal>
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
					className={classNames("flex-1", {hidden: !formData.id_supplier})}
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
							<Cell>{selectedItem?.harga * item.qty}</Cell>
							<Cell>
								<Button onClick={() => removeItem(id_item)} icon="faTrash" />
							</Cell>
						</>
					);
				}}
			/>

			{Object.entries(formData.items ?? {}).map(([id_item, item]) => {})}
		</>
	);
}

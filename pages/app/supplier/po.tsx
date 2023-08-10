import {FormEventHandler, useEffect, useRef} from "react";

import {Control, useForm, UseFormReset, useWatch} from "react-hook-form";

import {
	ModalTypePreview,
	TSupplierItem,
	TSupplierPOUpsert,
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
import {defaultErrorMutation, selectUnitData} from "@constants";
import {getLayout} from "@hoc";
import {useTableFilter} from "@hooks";
import {classNames, modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

POSupplier.getLayout = getLayout;

type FormType = TSupplierPOUpsert & {
	type: ModalTypePreview;
	tempIdItem: string;
};
type ModalChildProps = {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
};

export default function POSupplier() {
	const modalRef = useRef<ModalRef>(null);

	const {formValue, hookForm} = useTableFilter();
	const {data, refetch} = trpc.supplier.po.get.useQuery(formValue);
	const {mutate: mutateUpsert} =
		trpc.supplier.po.upsert.useMutation(defaultErrorMutation);
	const {mutate: mutateDelete} =
		trpc.supplier.po.delete.useMutation(defaultErrorMutation);

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
					return mutateDelete({id: body.id}, {onSuccess});
				case "add":
				case "edit":
					return mutateUpsert(body, {onSuccess});
				default:
					return;
			}
		})();

		function onSuccess() {
			refetch();
			modalRef.current?.hide();
		}
	};

	function showModal(form: Partial<FormType>) {
		modalRef.current?.show();
		reset(form);
	}

	return (
		<>
			<Modal
				size="lg"
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
				keyExtractor={item => item?.id}
				header={[
					"Nama Supplier",
					"Tgl PO",
					"Tgl Request Kirim",
					"PPN",
					"Keterangan",
					"Action",
				]}
				topComponent={
					<Button onClick={() => showModal({type: "add"})}>Add</Button>
				}
				renderItem={({Cell, item}) => {
					const {supplier, id, tgl_po, tgl_req_send, keterangan, ppn} =
						item ?? {};
					return (
						<>
							<Cell>{supplier?.name}</Cell>
							<Cell>{tgl_po}</Cell>
							<Cell>{tgl_req_send}</Cell>
							<Cell>{ppn ? "Ya" : "Tidak"}</Cell>
							<Cell>{keterangan}</Cell>
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

	const {data: dataSupplier} = trpc.supplier.get.useQuery({limit: 9999});

	const {isDelete, isPreview} = modalTypeParser(formData.type);

	const selectedSupplier = dataSupplier?.rows.find(
		e => e.id === formData.id_supplier,
	);
	const selectedItems = selectedSupplier?.OrmSupplierItems.reduce(
		(ret, item) => {
			return {...ret, [item.id]: item};
		},
		{} as MyObject<TSupplierItem>,
	);

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
				items: {
					...prev.items,
					[formData.tempIdItem]: {harga: 0, qty: 0, unit: "pcs"},
				},
			};
		});
	}, [formData.tempIdItem]);

	if (isDelete) return <Button type="submit">Delete</Button>;

	const dataTempIdItem = selectMapper(
		selectedSupplier?.OrmSupplierItems ?? [],
		"id",
		"code_item",
	)?.filter(data => !Object.keys(formData.items ?? {}).includes(data.value));

	return (
		<>
			<div className="flex gap-2">
				<Select
					className="flex-1"
					control={control}
					fieldName="id_supplier"
					data={selectMapper(dataSupplier?.rows ?? [], "id", "name")}
				/>
				<Select
					control={control}
					fieldName="tempIdItem"
					key={formData.tempIdItem}
					data={dataTempIdItem}
					className={classNames("flex-1", {
						hidden:
							!formData.id_supplier || isPreview || dataTempIdItem.length <= 0,
					})}
				/>
				<Input
					className="flex-1"
					control={control}
					fieldName="tgl_po"
					type="date"
					placeholder="Tanggal PO"
					label="Tanggal"
				/>
				<Input
					className="flex-1"
					control={control}
					fieldName="tgl_req_send"
					type="date"
					placeholder="Tanggal Permintaan Pengiriman"
					label="Tanggal"
				/>
				<Input type="checkbox" control={control} fieldName="ppn" label="PPN" />
			</div>

			<Table
				data={Object.entries(formData.items ?? {})}
				header={["Nama", "Harga", "Jumlah", "Total", "∂"]}
				className={classNames({
					hidden: Object.keys(formData.items ?? {}).length <= 0,
				})}
				renderItem={({item: [id_item, item], Cell}) => {
					const selectedItem = selectedItems?.[id_item];

					return (
						<>
							<Cell>{selectedItem?.name_item}</Cell>
							<Cell>
								<Input
									type="decimal"
									fieldName={`items.${id_item}.harga`}
									className="flex-1"
									control={control}
								/>
							</Cell>
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
							<Cell>{(item?.harga ?? 0) * (item?.qty ?? 0)}</Cell>
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

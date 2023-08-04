import {FormEventHandler, useRef} from "react";

import {Control, useForm, useWatch} from "react-hook-form";

import {
	ModalTypeSelect,
	RouterOutput,
	TSupplierUpsert,
} from "@appTypes/app.type";
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	MultipleSelect,
	selectMapper,
	TableFilterV2,
	TableFilterV2Ref,
} from "@components";
import {getLayout} from "@hoc";
import {modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

type SupplierForm = TSupplierUpsert & {type: ModalTypeSelect};

Supplier.getLayout = getLayout;

export default function Supplier() {
	const modalRef = useRef<ModalRef>(null);
	const tableRef = useRef<TableFilterV2Ref>(null);

	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<SupplierForm>();
	const {mutate: mutateUpsert} = trpc.supplier.upsert.useMutation();
	const {mutate: mutateDelete} = trpc.supplier.delete.useMutation();

	const modalForm = watch();

	const {isPreview, isSelect, modalTitle} = modalTypeParser(
		modalForm.type,
		"Item Supplier",
	);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, item = [], ...rest}) => {
			switch (type) {
				case "add":
				case "edit":
					return mutateUpsert({...rest, item}, {onSuccess});
				case "delete":
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
		initValue?: Partial<Omit<SupplierForm, "type">>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<TableFilterV2<RouterOutput["supplier"]["get"]["rows"][number]>
				ref={tableRef}
				header={["Nama", "Item", "Action"]}
				useQuery={form => trpc.supplier.get.useQuery(form)}
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
							<Button onClick={() => showModal("add", {})}>Add</Button>
						</>
					)
				}
				renderItem={({item, Cell}) => {
					const {SupplierItem, ...restSupplier} = item;
					const rest: TSupplierUpsert = {
						...item,
						item: SupplierItem.map(e => e.id),
					};

					return (
						<>
							<Cell>{restSupplier.name}</Cell>
							<Cell>
								{SupplierItem.map(supItem => supItem.name_item).join(" | ")}
							</Cell>
							<Cell className="gap-2">
								<Button
									icon="faMagnifyingGlass"
									onClick={() => showModal("preview", rest)}
								/>
								<Button onClick={() => showModal("edit", rest)} icon="faEdit" />
								<Button
									onClick={() => showModal("delete", {id: item.id})}
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

function ModalChildSupItem({control}: {control: Control<SupplierForm>}) {
	const {data} = trpc.supplier.item.get.useQuery({
		withSupplier: false,
		limit: 99999,
	});

	const {type} = useWatch({control});
	const {isDelete} = modalTypeParser(type);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<>
			<Input label="Name" control={control} fieldName="name" />
			<MultipleSelect
				label="Item"
				control={control}
				fieldName="item"
				data={selectMapper(data?.rows ?? [], "id", "name_item")}
			/>
			<Button type="submit">Submit</Button>
		</>
	);
}

import {ScanListFormType} from "pages/app/scan/[route]/list";
import {useWatch} from "react-hook-form";

import {Wrapper} from "@appComponent/Wrapper";
import {FormProps, UnitQty} from "@appTypes/app.type";
import {Button, Cells, Input, Table, Text} from "@components";
import {useLoader} from "@hooks";
import type {KJD} from "@trpc/routers/kanban/po";
import {modalTypeParser, qtyMap} from "@utils";
import {trpc} from "@utils/trpc";

import {RenderMesin} from "./RenderMesin";

type RenderItemProps = FormProps<ScanListFormType, "control" | "reset"> & {
	selectedSppbIn?: KJD;
};

export function RenderItem({
	control,
	reset,
	selectedSppbIn: inn,
}: RenderItemProps) {
	const dataForm = useWatch({control});

	const {
		type: modalType,
		id_sppb_in: idSppbIn,
		items: kanbanItems = {},
	} = dataForm;

	const {mutateOpts, ...loader} = useLoader();
	const {mutate: mutateItem} = trpc.kanban.deleteItem.useMutation(mutateOpts);

	const {isPreview, isPreviewEdit} = modalTypeParser(modalType);

	const selectedSppbInItemId = Object.keys(kanbanItems)?.[0]!;
	const selectedSppbInItem = inn?.OrmPOItemSppbIns.find(
		e => e.id === selectedSppbInItemId,
	);

	const qtyTotal = {
		[selectedSppbInItemId]: selectedSppbInItem?.OrmKanbanItems.reduce(
			(a, e) => {
				qtyMap(({qtyKey}) => {
					if (!a?.[qtyKey]) a[qtyKey] = 0;
					a[qtyKey] += e[qtyKey]!;
				});
				return a;
			},
			{} as UnitQty,
		),
	};

	const qtyMax = qtyMap(({qtyKey}) => {
		return {[qtyKey]: selectedSppbInItem?.[qtyKey]!};
	}).reduce((a, b) => ({...a, ...b}));

	function deleteItem(id_item: string, id?: string) {
		reset(({items, list_mesin, callbacks = [], ...prevValue}) => {
			delete items[id_item];
			delete list_mesin[id_item];
			return {
				...prevValue,
				items,
				list_mesin,
				callbacks: [...callbacks, () => mutateItem(id)],
			};
		});
	}

	return (
		<>
			{loader.component}
			<Table
				header={[
					"Kode Item",
					"Nama Item",
					"Nomor Lot",
					"Jumlah",
					!isPreview && "Action",
				]}
				data={Object.entries(kanbanItems)}
				renderItemEach={({Cell, item: [id_item]}) => {
					const rowItem = selectedSppbInItem;
					const keterangan = rowItem?.OrmMasterItem?.keterangan;

					return (
						<Cell colSpan={5} className="flex flex-col gap-2">
							{!!keterangan && (
								<Wrapper title="Keterangan">{keterangan}</Wrapper>
							)}
							<RenderMesin
								reset={reset}
								control={control}
								masterId={rowItem?.master_item_id!}
								idItem={id_item}
							/>
						</Cell>
					);
				}}
				renderItem={({Cell, item: [id_item, item]}) => {
					if (item?.id_sppb_in !== idSppbIn) return false;

					const rowItem = selectedSppbInItem;
					const selectedItem = rowItem?.OrmKanbanItems.find(
						e => e.id === item?.id,
					);

					return (
						<>
							<Input
								className="hidden"
								control={control}
								shouldUnregister
								defaultValue={rowItem?.master_item_id}
								fieldName={`items.${id_item}.master_item_id`}
							/>
							<Input
								className="hidden"
								control={control}
								shouldUnregister
								defaultValue={rowItem?.id_item}
								fieldName={`items.${id_item}.id_item_po`}
							/>
							<DetailItem idItem={rowItem?.master_item_id!} Cell={Cell} />
							<Cell>{rowItem?.lot_no}</Cell>
							<Cell>
								<div className="flex gap-2">
									{qtyMap(({num, qtyKey: keyQty, unitKey: keyUnit}) => {
										const sppbItemQty = rowItem?.[keyQty];
										if (!sppbItemQty || sppbItemQty == 0) return null;

										const maxValue = parseFloat(qtyMax?.[keyQty]?.toString()!);

										const currentQty = parseFloat(
											selectedItem?.[keyQty]?.toString() ?? "0",
										);
										const calculatedQty =
											qtyTotal?.[selectedSppbInItemId]?.[keyQty]! ?? 0;

										const defaultValue = isPreviewEdit
											? maxValue - calculatedQty + currentQty
											: maxValue - calculatedQty;

										return (
											<div className="flex-1" key={`${rowItem.id}${num}`}>
												<Input
													type="decimal"
													control={control}
													defaultValue={defaultValue}
													fieldName={`items.${id_item}.${keyQty}`}
													label={`Jumlah ${num}`}
													rightAcc={
														<Text>{rowItem.OrmCustomerPOItem?.[keyUnit]}</Text>
													}
													rules={{
														max: {
															value: defaultValue,
															message: `max is ${defaultValue}`,
														},
													}}
												/>
												<Input
													className="hidden"
													control={control}
													defaultValue={rowItem.id}
													fieldName={`items.${id_item}.id_item`}
												/>
											</div>
										);
									})}
								</div>
							</Cell>
							<Cell className="flex gap-2">
								{!isPreview && (
									<Button onClick={() => deleteItem(id_item, item?.id)}>
										Delete
									</Button>
								)}
							</Cell>
						</>
					);
				}}
			/>
		</>
	);
}

function DetailItem({idItem, Cell}: {idItem: string; Cell: Cells["Cell"]}) {
	const {data} = trpc.item.detail.useQuery(idItem);

	return (
		<>
			<Cell>{data?.kode_item}</Cell>
			<Cell>{data?.name}</Cell>
		</>
	);
}

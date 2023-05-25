import {FormType} from "pages/app/kanban";
import {Control, UseFormReset, useWatch} from "react-hook-form";

import {ItemDetail} from "@appTypes/props.type";
import {Button, Input, Table, Text} from "@components";
import {defaultErrorMutation} from "@constants";
import {useKanban} from "@hooks";
import {modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

import {qtyList} from "../ModalChild_po";
import {RenderMesin} from "./RenderMesin";

type RenderItemProps = {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
};

export function RenderItem({control, reset}: RenderItemProps) {
	const {dataKanban} = useKanban();

	const [idKanban, idSppbIn, kanbanItems = {}, id_po, modalType] = useWatch({
		control,
		name: ["id", "id_sppb_in", "items", "id_po", "type"],
	});
	const {mutate: mutateItem} =
		trpc.kanban.deleteItem.useMutation(defaultErrorMutation);
	const {data: dataSppbIn} = trpc.sppb.in.get.useQuery(
		{
			type: "sppb_in",
			where: {id_po},
		},
		{enabled: !!id_po},
	);

	const {data: itemDetails = []} = trpc.kanban.itemDetail.useQuery<
		any,
		ItemDetail[]
	>(Object.entries(kanbanItems ?? {}).map(([, e]) => e.master_item_id));

	const {isPreview, isPreviewEdit} = modalTypeParser(modalType);

	const selectedSppbIn = dataSppbIn?.find(e => e.id === idSppbIn);
	const selectedKanban = dataKanban?.find(e => e.id === idKanban);

	const itemsInSelectedKanban = dataKanban
		?.filter(e => e.id_sppb_in === idSppbIn)
		.reduce<Record<string, Record<`qty${typeof qtyList[number]}`, number>>>(
			(ret, e) => {
				qtyList.forEach(num => {
					const keyQty = `qty${num}` as const;
					Object.entries(e.items ?? {}).forEach(([key, val]) => {
						if (!ret[key]) ret[key] = {};
						if (!ret[key][keyQty]) ret[key][keyQty] = 0;
						ret[key][keyQty] += val[keyQty];
					});
				});
				return ret;
			},
			{},
		);

	function addMesin(id_item: string) {
		reset(({list_mesin, ...prev}) => {
			const e = list_mesin[id_item] ?? [];
			return {
				...prev,
				list_mesin: {...list_mesin, [id_item]: [...e, ""]},
			};
		});
	}

	return (
		<Table
			header={["Kode Item", "Nama Item", "Jumlah", "Action"]}
			data={Object.entries(kanbanItems)}
			renderItemEach={({Cell, item: [id_item]}, index) => {
				const rowItem = selectedSppbIn?.items?.find(e => e.id === id_item);

				return (
					<Cell colSpan={4} className="flex flex-col gap-2">
						<RenderMesin
							index={index}
							reset={reset}
							control={control}
							masterId={rowItem?.master_item_id}
							idItem={id_item}
						/>
					</Cell>
				);
			}}
			renderItem={({Cell, item: [id_item, item]}, index) => {
				if (item.id_sppb_in !== idSppbIn) return false;

				const rowItem = selectedSppbIn?.items?.find(e => e.id === id_item);
				const selectedItem = selectedKanban?.items?.[id_item];
				const detailItem = itemDetails[index] as ItemDetail;

				return (
					<>
						<Input
							className="hidden"
							control={control}
							shouldUnregister
							defaultValue={rowItem?.master_item_id}
							fieldName={`items.${id_item}.master_item_id`}
						/>
						<Cell>{detailItem?.kode_item}</Cell>
						<Cell>{detailItem?.OrmKategoriMesin.name}</Cell>
						<Cell>
							<div className="flex gap-2">
								{qtyList.map(num => {
									const keyQty = `qty${num}` as const;
									const keyUnit = `unit${num}` as const;

									if (!rowItem?.[keyQty]) return null;

									const maxValue = rowItem?.[keyQty];
									const currentQty = selectedItem?.[keyQty] ?? 0;
									const calculatedQty =
										itemsInSelectedKanban?.[id_item]?.[keyQty] ?? 0;
									const defaultValue = isPreviewEdit
										? maxValue - calculatedQty + currentQty
										: maxValue - calculatedQty;

									return (
										<div className="flex-1" key={`${rowItem.id}${num}`}>
											<Input
												type="decimal"
												control={control}
												defaultValue={defaultValue as string}
												fieldName={`items.${id_item}.${keyQty}`}
												label={`Jumlah ${num}`}
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
												rightAcc={<Text>{rowItem?.itemDetail?.[keyUnit]}</Text>}
											/>
										</div>
									);
								})}
							</div>
						</Cell>
						<Cell className="flex gap-2">
							<Button onClick={() => addMesin(id_item)}>Add Mesin</Button>
							{!isPreview && (
								<Button
									onClick={() => {
										reset(({items, callbacks = [], ...prevValue}) => {
											delete items[id_item];
											return {
												...prevValue,
												items,
												callbacks: [...callbacks, () => mutateItem(item.id)],
											};
										});
									}}>
									Delete
								</Button>
							)}
						</Cell>
					</>
				);
			}}
		/>
	);
}

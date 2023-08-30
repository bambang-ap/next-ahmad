// @ts-nocheck

import {ScanListFormType} from "pages/app/scan/[route]/list";
import {Control, UseFormReset, useWatch} from "react-hook-form";

import {Wrapper} from "@appComponent/Wrapper";
import {Button, Cells, Input, Table, Text} from "@components";
import {defaultErrorMutation} from "@constants";
import {modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

import {qtyList} from "../ModalChild_po";
import {RenderMesin} from "./RenderMesin";

type RenderItemProps = {
	control: Control<ScanListFormType>;
	reset: UseFormReset<ScanListFormType>;
};

export function RenderItem({control, reset}: RenderItemProps) {
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

	const {isPreview, isPreviewEdit} = modalTypeParser(modalType);

	const selectedSppbIn = dataSppbIn?.find(e => e.id === idSppbIn);
	// const selectedKanban = dataKanban?.find(e => e.id === idKanban);
	const {data: selectedKanban} = trpc.kanban.detail.useQuery(idKanban, {
		enabled: !!idKanban,
	});
	const {data: selectedKanbans = []} = trpc.kanban.get.useQuery({
		type: "kanban",
		where: {id_sppb_in: idSppbIn},
	});

	const itemsInSelectedKanban = selectedKanbans
		// dataKanban?.filter(e => e.id_sppb_in === idSppbIn)
		.reduce<Record<string, Record<`qty${typeof qtyList[number]}`, number>>>(
			(ret, e) => {
				qtyList.forEach(num => {
					const keyQty = `qty${num}` as const;
					Object.entries(e.items ?? {}).forEach(([key, val]) => {
						if (!ret[key]) ret[key] = {};
						if (!ret[key][keyQty]) ret[key][keyQty] = 0;
						ret[key][keyQty] += parseFloat(val[keyQty] ?? 0);
					});
				});
				return ret;
			},
			{},
		);

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
		<Table
			header={[
				"Kode Item",
				"Nama Item",
				"Nomor Lot",
				"Jumlah",
				!isPreview && "Action",
			]}
			data={Object.entries(kanbanItems)}
			renderItemEach={({Cell, item: [id_item, item]}, index) => {
				const rowItem = selectedSppbIn?.items?.find(e => e.id === id_item);
				const {keterangan} = item.OrmMasterItem ?? {};
				return (
					<Cell colSpan={5} className="flex flex-col gap-2">
						{!!keterangan && (
							<Wrapper title="Keterangan">
								{item.OrmMasterItem?.keterangan}
							</Wrapper>
						)}
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
			renderItem={({Cell, item: [id_item, item]}) => {
				if (item.id_sppb_in !== idSppbIn) return false;

				const rowItem = selectedSppbIn?.items?.find(e => e.id === id_item);
				const selectedItem = selectedKanban?.items?.[id_item];

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
						<DetailItem idItem={rowItem?.master_item_id} Cell={Cell} />
						<Cell>{rowItem?.lot_no}</Cell>
						<Cell>
							<div className="flex gap-2">
								{qtyList.map(num => {
									const keyQty = `qty${num}` as const;
									const keyUnit = `unit${num}` as const;

									if (!rowItem?.[keyQty]) return null;

									const maxValue = parseFloat(rowItem?.[keyQty] ?? 0);
									const currentQty = selectedItem?.[keyQty] ?? 0;

									const calculatedQty = parseFloat(
										itemsInSelectedKanban?.[id_item]?.[keyQty] ?? 0,
									);
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
							{!isPreview && (
								<Button onClick={() => deleteItem(id_item, item.id)}>
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

function DetailItem({idItem, Cell}: {idItem: string; Cell: Cells["Cell"]}) {
	const {data} = trpc.item.detail.useQuery(idItem);

	return (
		<>
			<Cell>{data?.kode_item}</Cell>
			<Cell>{data?.name}</Cell>
		</>
	);
}

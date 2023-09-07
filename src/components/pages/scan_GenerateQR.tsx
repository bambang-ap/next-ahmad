import {useEffect, useState} from "react";

import {KanbanFormType} from "pages/app/kanban";
import {FormTypeScan} from "pages/app/scan/[route]";
import {Control, useForm, useWatch} from "react-hook-form";

import {
	KanbanGetRow,
	RouterOutput,
	TPOItem,
	TScanTarget,
} from "@appTypes/app.type";
import {eCategoryReject} from "@appTypes/app.zod";
import {Input, Select, SelectPropsData, Text} from "@components";
import {CATEGORY_REJECT, CATEGORY_REJECT_DB} from "@enum";
import {useSession} from "@hooks";
import {
	dateUtils,
	prevDataScan,
	qtyMap,
	scanMapperByStatus,
	typingCallback,
} from "@utils";
import {trpc} from "@utils/trpc";

import {RenderMesin} from "./kanban_ModalChild/RenderMesin";

export function ScanDetailKanban({
	route,
	control,
	...kanban
}: RouterOutput["kanban"]["get"][number] & {
	route: TScanTarget;
	status?: boolean;
	control: Control<FormTypeScan>;
}) {
	const {id, notes, ...formData} = useWatch({control});
	const categoryReject = Object.values(eCategoryReject.enum).map<
		SelectPropsData<CATEGORY_REJECT_DB>
	>(value => ({value, label: CATEGORY_REJECT[value]}));

	const {data} = useSession();
	const {mutate: editNotes} = trpc.scan.editNotes.useMutation();

	const [jumlahPrev, jumlahNext] = scanMapperByStatus(route);

	const {data: dataPrev} = prevDataScan(route, formData);

	const fieldKey = `item_${route}` as const;
	const isQC = route === "qc";
	const isProduksi = route === "produksi";

	useEffect(() => {
		typingCallback(() => {
			editNotes({notes, id});
		}, 1000);
	}, [id, notes]);

	return (
		<div className="bg-slate-700 p-[1px] flex flex-col gap-[1px]">
			<div className="bg-white">
				date kanban : {dateUtils.full(kanban.createdAt)}
			</div>
			<div className="flex gap-[1px]">
				<div className="flex-1 bg-white text-center">
					current : {data?.user?.name}
				</div>
				<div className="flex-1 bg-white text-center">
					created by : {kanban.dataCreatedBy?.name}
				</div>
				<div className="flex-1 bg-white text-center">
					customer : {kanban.OrmCustomerPO?.OrmCustomer.name}
				</div>
			</div>
			<div className="flex gap-[1px]">
				<div className="flex-1 bg-white text-center">
					nomor po : {kanban.OrmCustomerPO?.nomor_po}
				</div>
				<div className="flex-1 bg-white text-center">
					nomor surat : {kanban.dataSppbIn?.nomor_surat}
				</div>
			</div>
			<div className="flex gap-[1px]">
				<Input
					className="flex-1 bg-white"
					control={control}
					fieldName="lot_no_imi"
					label="Nomor Lot IMI"
				/>
				<Input
					multiline
					forceEditable
					className="flex-1 bg-white"
					control={control}
					fieldName="notes"
					label="Notes"
				/>
			</div>

			<div className="flex gap-[1px]">
				<div className="flex-1 bg-white text-center">kode item</div>
				<div className="flex-1 bg-white text-center">nama item</div>
				<div className="flex-1 bg-white text-center">{jumlahPrev}</div>
				<div className="flex-1 bg-white text-center">{jumlahNext}</div>
				{isQC && (
					<div className="flex-1 bg-white text-center">Jumlah Reject</div>
				)}
			</div>

			{Object.entries(kanban.items).map(([id_item, item], i) => {
				const detail = kanban.dataSppbIn?.items?.find(
					e => e.id === id_item,
				)?.itemDetail;

				// eslint-disable-next-line @typescript-eslint/no-shadow
				const jj = dataPrev?.find(([id]) => id === item.id);

				return (
					<div key={id_item}>
						<div className="flex gap-[1px]">
							<Input
								className="hidden"
								defaultValue={item.id}
								control={control}
								fieldName={`${fieldKey}.${i}.0`}
							/>
							{isQC && (
								<>
									<Input
										className="hidden"
										defaultValue={item.id}
										control={control}
										fieldName={`item_qc_reject.${i}.0`}
									/>
									<Input
										control={control}
										className="hidden"
										defaultValue={item.id}
										fieldName={`item_qc_reject_category.${i}.0`}
									/>
								</>
							)}
							<div className="flex-1 bg-white text-center">
								{/* FIXME: */}
								{/* @ts-ignore */}
								{/* {detail?.kode_item} */}
								{item.OrmMasterItem?.kode_item}
							</div>
							{/* @ts-ignore */}
							<div className="flex-1 bg-white text-center">
								{item.OrmMasterItem?.name}
							</div>
							<div className="flex-1 flex flex-col">
								{qtyMap(({qtyKey, unitKey, num}) => {
									const jumlah =
										(isProduksi
											? kanban.dataScan?.item_from_kanban?.[item?.id!]?.[qtyKey]
											: undefined) ??
										jj?.[num] ??
										item[qtyKey];

									if (!jumlah) return null;

									return (
										<div className="flex-1 bg-white">
											{jumlah} {detail?.[unitKey]}
										</div>
									);
								})}
							</div>
							<div className="flex-1">
								{qtyMap(({qtyKey, unitKey, num}) => {
									const jumlah = jj?.[num] ?? item[qtyKey];

									if (!jumlah) return null;

									return (
										<Input
											className="flex-1 bg-white"
											key={jumlah}
											type="decimal"
											defaultValue={jumlah}
											control={control}
											rules={{
												max: {value: jumlah, message: `max is ${jumlah}`},
											}}
											rightAcc={<Text>{detail?.[unitKey]}</Text>}
											fieldName={`${fieldKey}.${i}.${num}`}
											label={`Jumlah ${num}`}
										/>
									);
								})}
							</div>
							{isQC && (
								<div className="flex-1">
									{qtyMap(({qtyKey, unitKey, num}) => {
										const jumlah = jj?.[num] ?? item[qtyKey];

										if (!jumlah) return null;

										const rejectMax =
											// @ts-ignore
											jumlah - (formData.item_qc?.[i]?.[num] ?? 0);

										return (
											<div className="flex gap-2 bg-white">
												<Input
													key={jumlah}
													className="flex-1"
													type="decimal"
													defaultValue={0}
													control={control}
													rules={{
														max: {
															value: rejectMax,
															message: `max is ${rejectMax}`,
														},
													}}
													rightAcc={<Text>{detail?.[unitKey]}</Text>}
													fieldName={`item_qc_reject.${i}.${num}`}
													label={`Jumlah Reject ${num}`}
												/>
												{formData.item_qc_reject?.[i]?.[num] ? (
													<Select
														shouldUnregister
														className="flex-1"
														control={control}
														data={categoryReject}
														fieldName={`item_qc_reject_category.${i}.${num}`}
													/>
												) : null}
											</div>
										);
									})}
								</div>
							)}
						</div>

						<RenderListMesin
							detail={detail}
							id_item={id_item}
							list_mesin={kanban.list_mesin}
						/>
					</div>
				);
			})}

			<div className="bg-white">keterangan : {kanban.keterangan}</div>
		</div>
	);
}

function RenderListMesin({
	detail,
	id_item,
	list_mesin,
}: {
	detail?: TPOItem;
	id_item: string;
	list_mesin: KanbanGetRow["list_mesin"];
}) {
	const [keyMesin, setKeyMesin] = useState(uuid());
	const {control, reset} = useForm<KanbanFormType>({
		defaultValues: {list_mesin},
	});

	useEffect(() => {
		setTimeout(() => setKeyMesin(uuid()), 500);
	}, []);

	if (!detail) return null;

	return (
		<div className="bg-white flex-1">
			<RenderMesin
				key={keyMesin}
				reset={reset}
				control={control}
				masterId={detail?.master_item_id}
				idItem={id_item}
			/>
		</div>
	);
}

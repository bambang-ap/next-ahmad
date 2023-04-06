import {FormType} from 'pages/app/scan/[route]';
import {Control, useWatch} from 'react-hook-form';

import {KanbanGetRow, RouterOutput, TScanTarget} from '@appTypes/app.type';
import {Input, Text} from '@components';
import {useSession} from '@hooks';
import {dateUtils, prevDataScan, qtyMap, scanMapperByStatus} from '@utils';

export function ScanDetailKanban({
	route,
	status,
	control,
	...kanban
}: RouterOutput['kanban']['get'][number] & {
	route: TScanTarget;
	status?: boolean;
	control: Control<FormType>;
}) {
	const {data} = useSession();

	const formData = useWatch({control});

	const [jumlahPrev, jumlahNext] = scanMapperByStatus(route);

	const {data: dataPrev} = prevDataScan(route, formData);

	const fieldKey = `item_${route}` as const;
	const isQC = route === 'qc';

	return (
		<div className="bg-slate-700 p-[1px] flex flex-col gap-[1px]">
			<div className="bg-white">
				date kanban : {dateUtils.full(kanban.createdAt)}
			</div>
			<div className="flex gap-[1px]">
				<div className="flex-1 bg-white text-center">
					current : {data.user?.name}
				</div>
				<div className="flex-1 bg-white text-center">
					created by : {kanban.dataCreatedBy?.name}
				</div>
				<div className="flex-1 bg-white text-center">
					customer : {kanban.dataPo?.customer?.name}
				</div>
			</div>
			<div className="flex gap-[1px]">
				<div className="flex-1 bg-white text-center">
					nomor po : {kanban.dataPo?.nomor_po}
				</div>
				<div className="flex-1 bg-white text-center">
					nomor surat : {kanban.dataSppbIn?.nomor_surat}
				</div>
			</div>
			<div className="flex gap-[1px]">
				<div className="flex-1 bg-white text-center">
					Lot no : {kanban.dataSppbIn?.lot_no}
				</div>
				<Input className="flex-1" control={control} fieldName={`lot_no_imi`} />
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
								<Input
									className="hidden"
									defaultValue={item.id}
									control={control}
									fieldName={`item_qc_reject.${i}.0`}
								/>
							)}
							<div className="flex-1 bg-white text-center">
								{detail?.kode_item}
							</div>
							<div className="flex-1 bg-white text-center">{detail?.name}</div>
							<div className="flex-1 flex flex-col">
								{qtyMap(({qtyKey, unitKey, num}) => {
									const jumlah = jj?.[num] ?? item[qtyKey];

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
											type="number"
											defaultValue={jumlah}
											control={control}
											rules={{
												max: {value: jumlah, message: `max is ${jumlah}`},
											}}
											rightAcc={<Text>{detail?.[unitKey]}</Text>}
											fieldName={`${fieldKey}.${i}.${num}`}
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
											jumlah - (formData.item_qc?.[i]?.[num] ?? 0);

										return (
											<Input
												key={jumlah}
												className="flex-1 bg-white"
												type="number"
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
											/>
										);
									})}
								</div>
							)}
						</div>
					</div>
				);
			})}

			<div className="flex gap-[1px]">
				<div className="w-1/6 bg-white text-center">nama mesin</div>
				<div className="w-1/6 bg-white text-center">nomor mesin</div>
				<div className="flex-1 gap-[1px] flex flex-col text-center">
					<div className="bg-white">propses</div>
					<div className="flex flex-1 gap-[1px]">
						<div className="flex-1 bg-white">nama proses</div>
						<div className="flex-1 bg-white">parameter</div>
						<div className="flex-1 bg-white">material</div>
						<div className="flex-1 bg-white">hardness</div>
					</div>
				</div>
			</div>

			<RenderListMesin data={kanban.listMesin} />

			<div className="bg-white">keterangan : {kanban.keterangan}</div>
		</div>
	);
}

export function RenderListMesin({data}: {data?: KanbanGetRow['listMesin']}) {
	return (
		<>
			{data?.map(({dataMesin, instruksi}) => {
				return (
					<div key={dataMesin?.id} className="flex gap-[1px]">
						<div className="w-1/6 bg-white">{dataMesin?.name}</div>
						<div className="w-1/6 bg-white">{dataMesin?.nomor_mesin}</div>
						<div className="flex-1">
							{instruksi?.map(({dataInstruksi, ...rest}) => {
								return (
									<div
										key={dataInstruksi?.id}
										className="flex flex-1 gap-[1px]">
										<div className="flex-1 bg-white">{dataInstruksi?.name}</div>
										<>
											{Object.entries(rest).map(([key, values]) => {
												return (
													<div
														className="flex flex-1 flex-col gap-[1px]"
														key={key}>
														{values.map(e => {
															return (
																<div
																	key={e?.id}
																	className="flex flex-col gap-[1px]">
																	<div className="flex-1 bg-white">
																		kategori : {e?.kategori?.name}
																	</div>
																	<div className="flex-1 bg-white">
																		{e?.name}
																	</div>
																</div>
															);
														})}
													</div>
												);
											})}
										</>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</>
	);
}

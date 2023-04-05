import {FormType} from 'pages/app/scan/[route]';
import {Control, useWatch} from 'react-hook-form';

import {RouterOutput, TScanTarget} from '@appTypes/app.type';
import {Input} from '@components';
import {useSession} from '@hooks';
import {dateUtils, prevDataScan, qtyMap} from '@utils';

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

	const {data: dataPrev} = prevDataScan(route, formData);

	const fieldKey = `item_${route}` as const;
	const isQC = route === 'qc';

	return (
		<>
			<div>current : {data.user?.name}</div>
			<div>date kanban : {dateUtils.full(kanban.createdAt)}</div>
			<div>created by : {kanban.dataCreatedBy?.name}</div>
			<div>customer : {kanban.dataPo?.customer?.name}</div>
			<div>customer : {kanban.dataPo?.nomor_po}</div>
			<div>nomor surat : {kanban.dataSppbIn?.nomor_surat}</div>
			<div>Lot no : {kanban.dataSppbIn?.lot_no}</div>
			<Input control={control} fieldName={`lot_no_imi`} />

			{Object.entries(kanban.items).map(([id_item, item], i) => {
				const detail = kanban.dataSppbIn?.items?.find(
					e => e.id === id_item,
				)?.itemDetail;

				const jj = dataPrev?.find(([id]) => id === item.id);

				return (
					<>
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
						<div>{detail?.kode_item}</div>
						<div>{detail?.name}</div>
						{qtyMap(({qtyKey, unitKey, num}) => {
							const jumlah = jj?.[num] ?? item[qtyKey];

							if (!jumlah) return null;

							const rejectMax = jumlah - (formData.item_qc?.[i]?.[num] ?? 0);

							return (
								<div key={qtyKey}>
									{jumlah} {detail?.[unitKey]}
									<Input
										key={jumlah}
										type="number"
										defaultValue={jumlah}
										control={control}
										rules={{max: {value: jumlah, message: `max is ${jumlah}`}}}
										fieldName={`${fieldKey}.${i}.${num}`}
									/>
									{isQC && (
										<Input
											key={jumlah}
											type="number"
											defaultValue={0}
											control={control}
											rules={{
												max: {value: rejectMax, message: `max is ${rejectMax}`},
											}}
											fieldName={`item_qc_reject.${i}.${num}`}
										/>
									)}
								</div>
							);
						})}
					</>
				);
			})}

			{kanban.listMesin?.map(({dataMesin, instruksi}) => {
				return (
					<div key={dataMesin?.id}>
						<div>nama mesin : {dataMesin?.name}</div>
						<div>nomor mesin : {dataMesin?.nomor_mesin}</div>
						<div>proses</div>
						{instruksi?.map(({dataInstruksi, ...rest}) => {
							return (
								<>
									<div>{dataInstruksi?.name}</div>
									{Object.entries(rest).map(([key, values]) => {
										return (
											<div key={key}>
												{values.map(e => {
													return (
														<>
															<div>{e?.name}</div>
															<div>
																kategori {key} : {e?.kategori?.name}
															</div>
														</>
													);
												})}
											</div>
										);
									})}
								</>
							);
						})}
					</div>
				);
			})}

			<div>keterangan : {kanban.keterangan}</div>
		</>
	);
}

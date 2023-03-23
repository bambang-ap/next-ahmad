import {useEffect} from 'react';

import {Control, UseFormReset, useWatch} from 'react-hook-form';

import {TCustomer, TInstruksiKanban, TMesin} from '@appTypes/app.zod';
import {Button, Input, Select, selectMapper, Table, Text} from '@components';
import {defaultErrorMutation} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {classNames} from '@utils';
import {trpc} from '@utils/trpc';

import {FormType} from '.';
import {qtyList} from '../customer/po/ModalChild';

export function ModalChild({
	control,
	reset,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const [
		idKanban,
		mesinIds = [],
		idCustomer,
		instruksiIds,
		idSppbIn,
		tempIdItem,
		kanbanItems = {},
		id_po,
		modalType,
	] = useWatch({
		control,
		name: [
			'id',
			'mesin_id',
			'id_customer',
			'instruksi_id',
			'id_sppb_in',
			'temp_id_item',
			'items',
			'id_po',
			'type',
		],
	});

	const {mutate: mutateItem} =
		trpc.kanban.deleteItem.useMutation(defaultErrorMutation);
	const {data: dataKanban} = trpc.kanban.get.useQuery({type: 'kanban'});
	const {data: dataCustomer} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {data: dataMesin} = trpc.basic.get.useQuery<any, TMesin[]>({
		target: CRUD_ENABLED.MESIN,
	});
	const {data: dataSppbIn} = trpc.sppb.get.useQuery(
		{
			type: 'sppb_in',
			where: {id_po},
		},
		{enabled: !!id_po},
	);
	const {data: dataInstruksi} = trpc.basic.get.useQuery<
		any,
		TInstruksiKanban[]
	>({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
	});

	const {data: dataPo} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
	});

	const isEdit = modalType === 'edit';
	const isPreview = modalType === 'preview';
	const isDelete = modalType === 'delete';
	const isPreviewEdit = isEdit || isPreview;
	const selectedSppbIn = dataSppbIn?.find(e => e.id === idSppbIn);
	const selectedKanban = dataKanban?.find(e => e.id === idKanban);

	const itemsInSelectedKanban = dataKanban
		?.filter(e => e.id_sppb_in === idSppbIn)
		.reduce<Record<string, Record<`qty${typeof qtyList[number]}`, number>>>(
			(ret, e) => {
				qtyList.forEach(num => {
					const keyQty = `qty${num}` as const;
					Object.entries(e.items).forEach(([key, val]) => {
						if (!ret[key]) ret[key] = {};
						if (!ret[key][keyQty]) ret[key][keyQty] = 0;
						ret[key][keyQty] += val[keyQty];
					});
				});
				return ret;
			},
			{},
		);

	useEffect(() => {
		if (tempIdItem) {
			reset(({items, id_sppb_in, ...prevValue}) => {
				return {
					...prevValue,
					temp_id_item: '',
					id_sppb_in,
					items: {...items, [tempIdItem]: {id_sppb_in}} as typeof items,
				};
			});
		}
	}, [tempIdItem]);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<div className="flex flex-col gap-2">
			<Input control={control} fieldName="name" label="Judul Kanban" />

			<div className="flex gap-2">
				<Select
					className="flex-1"
					firstOption="- Pilih Customer -"
					control={control}
					data={selectMapper(dataCustomer ?? [], 'id', 'name')}
					fieldName="id_customer"
				/>
				{idCustomer && (
					<Select
						className="flex-1"
						control={control}
						fieldName="id_po"
						firstOption="- Pilih PO -"
						data={selectMapper(
							dataPo?.filter(e => e.id_customer === idCustomer) ?? [],
							'id',
							'nomor_po',
						)}
					/>
				)}

				{id_po && (
					<Select
						className="flex-1"
						control={control}
						fieldName="id_sppb_in"
						firstOption="- Pilih Surat Jalan -"
						data={selectMapper(dataSppbIn ?? [], 'id', 'nomor_surat')}
					/>
				)}

				{idSppbIn && (
					<Select
						className="flex-1"
						control={control}
						fieldName="temp_id_item"
						firstOption="- Tambah Item -"
						data={selectMapper(
							selectedSppbIn?.items.filter(
								e => !Object.keys(kanbanItems).includes(e.id),
							) ?? [],
							'id',
							'itemDetail.kode_item',
						)}
					/>
				)}
			</div>

			<Table
				className="max-h-[250px] overflow-y-auto"
				header={['Kode Item', 'Nama Item', 'Jumlah', 'Action']}
				data={Object.entries(kanbanItems)}
				renderItem={({Cell, item: [id_item, item]}) => {
					if (item.id_sppb_in !== idSppbIn) return false;

					const rowItem = selectedSppbIn?.items.find(e => e.id === id_item);
					const selectedItem = selectedKanban?.items[id_item];

					return (
						<>
							<Cell>{rowItem?.itemDetail?.kode_item}</Cell>
							<Cell>{rowItem?.itemDetail?.name}</Cell>
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
													type="number"
													control={control}
													defaultValue={defaultValue}
													fieldName={`items.${id_item}.${keyQty}`}
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
													rightAcc={
														<Text>{rowItem?.itemDetail?.[keyUnit]}</Text>
													}
												/>
											</div>
										);
									})}
								</div>
							</Cell>
							<Cell>
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

			{!isPreview && (
				<Button
					onClick={() => {
						reset(({mesin_id = [], ...rest}) => {
							mesin_id.push(undefined);
							return {...rest, mesin_id};
						});
					}}>
					Add Mesin
				</Button>
			)}

			<Table
				className={classNames('max-h-[250px] overflow-y-auto', {
					hidden: !mesinIds || mesinIds?.length <= 0,
				})}
				data={mesinIds}
				header={['Mesin', 'Instruksi']}
				renderItem={({Cell, item: idMesin}, i) => {
					const ids_instruksi = instruksiIds?.[idMesin] ?? [];
					return (
						<>
							<Cell valign="top" className="flex-col gap-2">
								<Select
									control={control}
									fieldName={`mesin_id.${i}`}
									firstOption={`- Pilih Mesin ${i + 1} -`}
									data={selectMapper(
										dataMesin?.filter(
											mesin =>
												mesin.id === idMesin || !mesinIds.includes(mesin.id),
										) ?? [],
										'id',
										'nomor_mesin',
									)}
								/>
								{idMesin && !isPreview && (
									<Button
										onClick={() =>
											reset(({instruksi_id = {}, ...rest}) => {
												instruksi_id[idMesin] = instruksi_id[idMesin] ?? [];
												instruksi_id[idMesin]?.push(undefined);
												return {...rest, instruksi_id};
											})
										}>
										Add Instruksi
									</Button>
								)}
								{!isPreview && (
									<Button
										onClick={() => {
											reset(({mesin_id = [], instruksi_id = {}, ...rest}) => {
												if (mesin_id[i]) delete instruksi_id?.[mesin_id[i]];
												return {
													...rest,
													mesin_id: mesin_id.remove(i),
													instruksi_id,
												};
											});
										}}>{`Hapus Mesin ${i + 1}`}</Button>
								)}
							</Cell>
							<Cell className="gap-2 flex-col">
								{ids_instruksi.map((id_instruksi, ii) => {
									return (
										<div key={id_instruksi} className="flex gap-2">
											<Select
												className="flex-1"
												control={control}
												firstOption={`- Pilih Instruksi ${ii + 1} -`}
												fieldName={`instruksi_id.${idMesin}.${ii}`}
												data={selectMapper(dataInstruksi ?? [], 'id', 'name')}
											/>
											{!isPreview && (
												<Button
													icon="faTrash"
													onClick={() => {
														reset(({instruksi_id, ...rest}) => {
															return {
																...rest,
																instruksi_id: {
																	...instruksi_id,
																	[idMesin]:
																		instruksi_id[idMesin]?.remove(i) ?? [],
																},
															};
														});
													}}
												/>
											)}
										</div>
									);
								})}
							</Cell>
						</>
					);
				}}
			/>

			{!isPreview && <Button type="submit">Submit</Button>}
		</div>
	);
}

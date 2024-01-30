import objectPath from 'object-path';
import {FormValue} from 'pages/app/customer/customer_sppb_out';
import {useWatch} from 'react-hook-form';

import {
	DiscountRenderer,
	getDiscValue,
	RenderTotalHarga,
} from '@appComponent/DiscountSelection';
import {SelectCustomer} from '@appComponent/PageTable/SelectCustomer';
import {Wrapper} from '@appComponent/Wrapper';
import {FormProps} from '@appTypes/app.type';
import {
	Button,
	Input,
	InputDummy,
	Select,
	selectMapper,
	Table,
	Text,
} from '@components';
import {REJECT_REASON_VIEW} from '@enum';
import {useSppbOut} from '@hooks';
import {isClosedParser, modalTypeParser, qtyMap, renderIndex} from '@utils';
import {trpc} from '@utils/trpc';

export function SppbOutModalChild({
	reset,
	control,
	setValue,
}: FormProps<FormValue, 'control' | 'reset' | 'setValue'>) {
	const dataForm = useWatch({control});
	const {id_customer, type: modalType, po: listPO, invoice_no} = dataForm;

	const {
		data: poDataa = [],
		isFetched: isRefetching,
		isFetching,
	} = trpc.sppb.out.getPO.useQuery(
		{id: id_customer!},
		{enabled: !!id_customer},
	);

	const {dataCustomer, dataKendaraan} = useSppbOut();
	const {isDelete, isAdd, isAddEdit, isEdit, isPreview} =
		modalTypeParser(modalType);
	const selectedCustomer = dataCustomer.find(e => e.id === id_customer);

	if (isDelete) return <Button type="submit">Ya</Button>;

	const poData = isClosedParser(poDataa);

	return (
		<>
			<InputDummy
				disabled
				className="flex-1"
				label="Nomor Surat"
				byPassValue={renderIndex(dataForm!, invoice_no!)}
			/>
			<Input type="date" control={control} fieldName="date" label="Tanggal" />
			<Select
				control={control}
				fieldName="id_kendaraan"
				label="Kendaraan"
				data={selectMapper(dataKendaraan, 'id', 'name')}
			/>
			<Input control={control} fieldName="keterangan" label="Keterangan" />
			<SelectCustomer
				control={control}
				fieldName="id_customer"
				data={dataCustomer}
			/>
			{selectedCustomer && (
				<>
					<Wrapper title="Alamat">{selectedCustomer.alamat}</Wrapper>
					<Wrapper title="No telp">{selectedCustomer.no_telp}</Wrapper>
					<Wrapper title="UP">{selectedCustomer.up}</Wrapper>
				</>
			)}

			{!!id_customer && (
				<>
					<Button
						onClick={() =>
							reset(prev => {
								const {po = []} = prev;
								return {
									...prev,
									po: [
										...po,
										{id_po: '', sppb_in: [{id_sppb_in: '', items: {}}]},
									],
								};
							})
						}>
						Add PO
					</Button>

					{listPO?.map((po, i) => {
						const poSelected = poData?.find(e => e.id === po.id_po);
						const sppbInIds = po.sppb_in?.map(e => e.id_sppb_in);

						const availablePo = poData?.filter(e => {
							if (po.id_po === e.id) return true;
							return !e.isClosed;
						});

						const poKey = `${isRefetching}${id_customer}${po.id_po}`;

						return (
							<>
								<div className="flex gap-2">
									<Select
										className="flex-1"
										key={poKey}
										label="PO"
										control={control}
										fieldName={`po.${i}.id_po`}
										isLoading={isFetching}
										data={selectMapper(availablePo, 'id', 'nomor_po')}
									/>

									<Button
										onClick={() =>
											reset(prev => {
												const u = prev.po[i];
												u?.sppb_in.push({id_sppb_in: '', items: {}});
												return {
													...prev,
													po: prev.po.replace(i, u!),
												};
											})
										}>
										Add Surat Jalan
									</Button>

									<Button
										onClick={() => {
											reset(prev => {
												return {...prev, po: prev.po.remove(i)};
											});
										}}>
										Delete PO
									</Button>
								</div>
								{po.sppb_in?.map((sppb, ii) => {
									const sppbInSelected = poSelected?.dSJIns.find(
										e => e.id === sppb.id_sppb_in,
									);

									const {dInItems} = sppbInSelected ?? {};

									const sppbKey = `${poKey}${sppb.id_sppb_in}`;

									const availableSppbIn = poSelected?.dSJIns?.filter(e => {
										if (sppb.id_sppb_in === e.id) return true;
										if (sppbInIds?.includes(e.id)) return false;
										return !e?.isClosed;
									});

									const sppbInSelection = selectMapper(
										availableSppbIn ?? [],
										'id',
										'nomor_surat',
									);

									const nameItems = `po.${i}.sppb_in.${ii}.items` as const;

									return (
										<>
											<div className="flex gap-2 items-center">
												<Select
													control={control}
													className="flex-1"
													key={sppbKey}
													fieldName={`po.${i}.sppb_in.${ii}.id_sppb_in`}
													label="Surat Jalan Masuk"
													data={sppbInSelection}
												/>
												<Button
													onClick={() => {
														reset(prev => {
															const u = prev.po[i]!;
															const sppb_in = u.sppb_in.remove(ii);
															return {
																...prev,
																po: prev.po.replace(i, {...u, sppb_in}),
															};
														});
													}}>
													Delete Surat Jalan
												</Button>
											</div>
											<Table
												data={dInItems}
												header={[
													'Nama Item',
													'Kode Item',
													'Nomor Lot',
													'Nomor Lot IMI',
													'Harga',
													'Jumlah',
													'Total',
													isAddEdit && 'Exclude',
												]}
												renderItemEach={({Cell, isLast}, _, items) => {
													if (!isLast) return false;

													return (
														<RenderTotalHarga
															Cell={Cell}
															colSpan={6}
															items={items}
															calculate={item => {
																const nameItem =
																	`${nameItems}.${item.id}` as const;
																const qty3 = objectPath.get<number>(
																	dataForm,
																	`${nameItem}.qty3`,
																	0,
																);

																const {totalPrice} = getDiscValue(
																	item.dPoItem.discount_type,
																	item.dPoItem.discount,
																	(item.dPoItem.harga ?? 0) * qty3,
																);

																return totalPrice;
															}}
														/>
													);
												}}
												renderItem={({Cell, item}) => {
													const {
														dItem,
														id: id_item,
														lot_no,
														isClosed,
														dPoItem,
														itemInScan,
														rejectedItems,
														dOutItems,
													} = item ?? {};

													const items = sppb.items?.[id_item];

													const lot_no_imi = sppbInSelected?.dKanbans
														.filter(e => e.dKnbItems?.[0]?.id_item === item.id)
														?.map(e => e.dScans?.[0]?.lot_no_imi)
														.join(' | ');

													const outItem = dOutItems.find(
														e => e.id === items?.id,
													);

													const hasItem = !!items?.id;

													const isExcludedItem = items?.exclude;

													const nameItem = `${nameItems}.${id_item}` as const;

													if (isPreview && !hasItem) return <></>;
													if (isClosed) {
														if (isAdd) return <></>;
														if (!hasItem) return <></>;
													}

													return (
														<>
															{!isExcludedItem && (
																<>
																	<Input
																		hidden
																		control={control}
																		shouldUnregister
																		defaultValue={dItem?.id}
																		fieldName={`${nameItem}.master_item_id`}
																	/>
																	<Input
																		hidden
																		control={control}
																		shouldUnregister
																		defaultValue={dPoItem.id}
																		fieldName={`${nameItem}.id_item_po`}
																	/>
																</>
															)}
															<Cell>{dItem?.name}</Cell>
															<Cell>{dItem?.kode_item}</Cell>
															<Cell>{lot_no}</Cell>
															<Cell>{lot_no_imi}</Cell>

															{isExcludedItem ? (
																<Cell colSpan={3} />
															) : (
																<>
																	<Cell>
																		<InputDummy
																			disabled
																			label="Harga"
																			className="flex-1"
																			byPassValue={dPoItem?.harga}
																		/>
																	</Cell>
																	<Cell className="flex gap-2">
																		{qtyMap(({qtyKey, unitKey, num}) => {
																			const unit = dPoItem?.[unitKey];

																			if (!unit) return null;

																			const qty = item?.[qtyKey];
																			const curQty = dOutItems.reduce(
																				(t, e) => t + (e?.[qtyKey] ?? 0),
																				0,
																			);

																			const qtyRejectRP =
																				rejectedItems?.[id_item]?.RP?.[qtyKey];
																			const qtyRejectTP =
																				rejectedItems?.[id_item]?.TP?.[qtyKey];
																			const qtyRejectSC =
																				rejectedItems?.[id_item]?.SC?.[qtyKey];

																			const totalReject =
																				(qtyRejectRP ?? 0) +
																				(qtyRejectTP ?? 0) +
																				(qtyRejectSC ?? 0);

																			const maxVal =
																				(qty ?? 0) - curQty - totalReject;

																			const max =
																				(outItem?.[qtyKey] ?? 0) + maxVal;
																			const jumlah = isAdd
																				? max
																				: (!!outItem?.[qtyKey]
																						? outItem?.[qtyKey]
																						: itemInScan?.[qtyKey] ?? max) ?? 0;

																			return (
																				<div className="flex-1">
																					<Input
																						type="decimal"
																						shouldUnregister
																						control={control}
																						label={`Qty ${num}`}
																						className="flex-1 bg-white"
																						rightAcc={<Text>{unit}</Text>}
																						defaultValue={jumlah.toString()}
																						fieldName={`${nameItem}.${qtyKey}`}
																						rules={{
																							max: {
																								value: max,
																								message: `max is ${max}`,
																							},
																						}}
																					/>
																					{!!qtyRejectTP && (
																						<Wrapper
																							noColon
																							sizes={['flex-1']}
																							title={REJECT_REASON_VIEW.TP}>
																							{`${qtyRejectTP?.toString()} ${unit}`}
																						</Wrapper>
																					)}
																					{!!qtyRejectRP && (
																						<Wrapper
																							noColon
																							sizes={['flex-1']}
																							title={REJECT_REASON_VIEW.RP}>
																							{`${qtyRejectRP?.toString()} ${unit}`}
																						</Wrapper>
																					)}
																					{!!qtyRejectSC && (
																						<Wrapper
																							noColon
																							sizes={['flex-1']}
																							title={REJECT_REASON_VIEW.SC}>
																							{`${qtyRejectSC?.toString()} ${unit}`}
																						</Wrapper>
																					)}
																				</div>
																			);
																		})}
																	</Cell>
																	<Cell className="gap-2">
																		<DiscountRenderer
																			control={control}
																			setValue={setValue}
																			qtyPrice={[
																				`${nameItem}.qty3`,
																				dPoItem?.harga!,
																			]}
																			type={[
																				dPoItem?.discount_type!,
																				`${nameItem}.discount_type`,
																			]}
																			discount={[
																				dPoItem?.discount!,
																				`${nameItem}.discount`,
																			]}
																		/>
																	</Cell>
																</>
															)}
															{isAddEdit && (
																<Cell>
																	<Input
																		key={nameItem}
																		type="checkbox"
																		label="exclude"
																		control={control}
																		fieldName={`${nameItem}.exclude`}
																		defaultValue={
																			hasItem
																				? false
																				: isEdit
																				? true
																				: undefined
																		}
																	/>
																</Cell>
															)}
														</>
													);
												}}
											/>
										</>
									);
								})}
							</>
						);
					})}
				</>
			)}
		</>
	);
}

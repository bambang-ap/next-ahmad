import {FormValue} from 'pages/app/customer/customer_sppb_out';
import {useWatch} from 'react-hook-form';

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
	// unregister,
	reset,
	control,
}: FormProps<FormValue, 'control' | 'reset' | 'unregister'>) {
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
			<Select
				label="Customer"
				control={control}
				fieldName="id_customer"
				data={selectMapper(dataCustomer, 'id', 'name')}
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
													'Jumlah',
													isAddEdit && 'Exclude',
												]}
												renderItem={({Cell, item}) => {
													const {
														dItem,
														id: id_item,
														lot_no,
														currentQty,
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

													const hj = dOutItems.find(e => e.id === items?.id);

													const hasItem = !!items?.id;

													const isExcludedItem = items?.exclude;

													const fieldNameItem =
														`po.${i}.sppb_in.${ii}.items.${id_item}` as const;

													const excludeComponent = (
														<Input
															key={fieldNameItem}
															type="checkbox"
															label="exclude"
															control={control}
															fieldName={`${fieldNameItem}.exclude`}
															defaultValue={
																hasItem ? false : isEdit ? true : undefined
															}
														/>
													);

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
																		fieldName={`${fieldNameItem}.master_item_id`}
																	/>
																	<Input
																		hidden
																		control={control}
																		shouldUnregister
																		defaultValue={dPoItem.id}
																		fieldName={`${fieldNameItem}.id_item_po`}
																	/>
																</>
															)}
															<Cell>{dItem?.name}</Cell>
															<Cell>{dItem?.kode_item}</Cell>
															<Cell>{lot_no}</Cell>
															<Cell>{lot_no_imi}</Cell>
															{isExcludedItem ? (
																<Cell />
															) : (
																<Cell className="flex gap-2">
																	{qtyMap(({qtyKey, unitKey, num}) => {
																		const qtyLeft =
																			itemInScan?.[qtyKey]! -
																			currentQty[qtyKey]!;
																		const cur = hj?.[qtyKey];
																		const jumlah = cur ?? qtyLeft;

																		const max = isEdit
																			? qtyLeft + cur!
																			: jumlah;
																		const unit = dPoItem?.[unitKey];

																		const qtyRejectRP =
																			rejectedItems.RP?.[qtyKey];
																		const qtyRejectTP =
																			rejectedItems.TP?.[qtyKey];
																		// const qtyRejectSC =
																		// 	rejectedItems.SC?.[qtyKey];

																		if (!unit) return null;

																		return (
																			<div className="flex-1">
																				<Input
																					key={jumlah}
																					type="decimal"
																					shouldUnregister
																					control={control}
																					label={`Qty ${num}`}
																					className="flex-1 bg-white"
																					rightAcc={<Text>{unit}</Text>}
																					defaultValue={jumlah.toString()}
																					fieldName={`${fieldNameItem}.${qtyKey}`}
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
																				{/* {!!qtyRejectSC && (
																				<Wrapper
																					noColon
																					sizes={["flex-1"]}
																					title={REJECT_REASON_VIEW.SC}>
																					{`${qtyRejectSC?.toString()} ${unit}`}
																				</Wrapper>
																			)} */}
																			</div>
																		);
																	})}
																</Cell>
															)}
															{isAddEdit && <Cell>{excludeComponent}</Cell>}
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

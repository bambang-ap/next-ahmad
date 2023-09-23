import {FormValue} from "pages/app/customer/customer_sppb_out";
import {useWatch} from "react-hook-form";

import {Wrapper} from "@appComponent/Wrapper";
import {FormProps} from "@appTypes/app.type";
import {Button, Input, Select, selectMapper, Table, Text} from "@components";
import {useSppbOut} from "@hooks";
import {
	isClosedParser,
	itemInScanParser,
	modalTypeParser,
	qtyMap,
	qtyReduce,
} from "@utils";
import {trpc} from "@utils/trpc";

export function SppbOutModalChild({
	control,
	reset,
}: FormProps<FormValue, "control" | "reset">) {
	const {id_customer, type: modalType, po: listPO} = useWatch({control});

	const {data: poDataa = [], isFetched: isRefetching} =
		trpc.sppb.out.getPO.useQuery({id_customer}, {enabled: !!id_customer});

	const {dataCustomer, dataKendaraan, invoiceId} = useSppbOut(id_customer);
	const {isDelete, isAdd, isEdit} = modalTypeParser(modalType);
	const selectedCustomer = dataCustomer.find(e => e.id === id_customer);

	if (isDelete) return <Button type="submit">Ya</Button>;

	const selectedPoIds = listPO?.map(e => e.id_po) ?? [];
	const poData = isClosedParser(poDataa);

	return (
		<>
			<Input
				disabled
				control={control}
				label="Nomor Surat"
				fieldName="invoice_no"
				key={invoiceId}
				defaultValue={invoiceId}
			/>
			<Input type="date" control={control} fieldName="date" label="Tanggal" />
			<Select
				control={control}
				fieldName="id_kendaraan"
				label="Kendaraan"
				data={selectMapper(dataKendaraan, "id", "name")}
			/>
			<Input control={control} fieldName="keterangan" label="Keterangan" />
			<Select
				label="Customer"
				control={control}
				fieldName="id_customer"
				data={selectMapper(dataCustomer, "id", "name")}
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
										{id_po: "", sppb_in: [{id_sppb_in: "", items: {}}]},
									],
								};
							})
						}>
						Add PO
					</Button>

					{listPO?.map((po, i) => {
						const poSelected = poData?.find(e => e.id === po.id_po);
						const selectedSppbInIds = po.sppb_in?.map(e => e.id_sppb_in) ?? [];
						const availablePo = poData?.filter(e => {
							if (po.id_po === e.id) return true;
							return !e.isClosed || !selectedPoIds.includes(e.id);
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
										data={selectMapper(availablePo, "id", "nomor_po")}
									/>

									<Button
										onClick={() =>
											reset(prev => {
												const u = prev.po[i];
												u?.sppb_in.push({id_sppb_in: "", items: {}});
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
									const sppbInSelected = poSelected?.OrmCustomerSPPBIns.find(
										e => e.id === sppb.id_sppb_in,
									);

									const listItems = sppbInSelected?.OrmPOItemSppbIns;
									const sppbKey = `${poKey}${sppb.id_sppb_in}`;

									const dd = listItems?.map(item => {
										const itemInScan = itemInScanParser(
											sppbInSelected?.OrmKanbans,
										);

										const currentQty = qtyReduce((ret, {qtyKey: num}) => {
											item.OrmCustomerSPPBOutItems.forEach(itm => {
												ret[num] += itm[num]!;
											});
											return ret;
										});

										return {...item, itemInScan, currentQty};
									});

									const availableSppbIn =
										poSelected?.OrmCustomerSPPBIns?.filter(e => {
											if (sppb.id_sppb_in === e.id) return true;
											return !e.isClosed || !selectedSppbInIds.includes(e.id);
										});

									const sppbInSelection = selectMapper(
										availableSppbIn ?? [],
										"id",
										"nomor_surat",
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
												data={dd}
												header={[
													"Kode Item",
													"Nama Item",
													"Nomor Lot",
													"Nomor Lot IMI",
													"Jumlah",
												]}
												renderItem={({Cell, item}) => {
													const {
														OrmMasterItem,
														id: id_item,
														lot_no,
														currentQty,
														OrmCustomerPOItem,
														OrmCustomerSPPBOutItems,
														itemInScan,
													} = item ?? {};
													const items = sppb.items?.[id_item];
													const lot_no_imi = sppbInSelected?.OrmKanbans?.map(
														e => e.OrmScans?.[0]?.lot_no_imi,
													).join(" | ");

													const hj = OrmCustomerSPPBOutItems.find(
														e => e.id === items?.id,
													);

													console.log(hj);

													return (
														<>
															<Input
																control={control}
																className="hidden"
																shouldUnregister
																defaultValue={OrmMasterItem?.id}
																fieldName={`po.${i}.sppb_in.${ii}.items.${id_item}.master_item_id`}
															/>
															<Input
																control={control}
																className="hidden"
																shouldUnregister
																defaultValue={OrmCustomerPOItem.id}
																fieldName={`po.${i}.sppb_in.${ii}.items.${id_item}.id_item_po`}
															/>
															<Cell>{OrmMasterItem?.name}</Cell>
															<Cell>{OrmMasterItem?.kode_item}</Cell>
															<Cell>{lot_no}</Cell>
															<Cell>{lot_no_imi}</Cell>
															<Cell className="flex gap-2">
																{qtyMap(({qtyKey, unitKey, num}) => {
																	const qtyLeft =
																		itemInScan?.[qtyKey]! - currentQty[qtyKey]!;
																	const cur = hj?.[qtyKey];
																	const jumlah = cur ?? qtyLeft;

																	const max = isEdit ? qtyLeft + cur! : jumlah;

																	if (!jumlah) return null;

																	return (
																		<Input
																			key={jumlah}
																			type="decimal"
																			shouldUnregister
																			control={control}
																			className="flex-1 bg-white"
																			label={`Qty ${num}`}
																			defaultValue={jumlah.toString()}
																			fieldName={`po.${i}.sppb_in.${ii}.items.${id_item}.${qtyKey}`}
																			rightAcc={
																				<Text>
																					{OrmCustomerPOItem?.[unitKey]}
																				</Text>
																			}
																			rules={{
																				max: {
																					value: max,
																					message: `max is ${max}`,
																				},
																			}}
																		/>
																	);
																})}
															</Cell>
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

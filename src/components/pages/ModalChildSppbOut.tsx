import {FormValue} from "pages/app/customer/customer_sppb_out";
import {useWatch} from "react-hook-form";

import {Wrapper} from "@appComponent/Wrapper";
import {FormProps} from "@appTypes/app.type";
import {Button, Input, Select, selectMapper, Table, Text} from "@components";
import {useSppbOut} from "@hooks";
import {itemInScanParser, modalTypeParser, qtyMap} from "@utils";
import {trpc} from "@utils/trpc";

export function SppbOutModalChild({
	control,
	reset,
}: FormProps<FormValue, "control" | "reset">) {
	const formData = useWatch({control});
	const {id_customer} = formData;
	const {data: poData} = trpc.sppb.out.getPOO.useQuery({id_customer});

	const {dataCustomer, dataKendaraan, invoiceId} = useSppbOut(id_customer);
	const {isDelete} = modalTypeParser(formData.type);

	const selectedCustomer = dataCustomer.find(e => e.id === id_customer);

	if (isDelete) return <Button type="submit">Ya</Button>;

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

					{formData.po?.map((po, i) => {
						const poSelected = poData?.find(e => e.id === po.id_po);
						return (
							<>
								<div className="flex gap-2">
									<Select
										className="flex-1"
										key={formData.id_customer}
										label="PO"
										control={control}
										fieldName={`po.${i}.id_po`}
										data={selectMapper(poData ?? [], "id", "nomor_po")}
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

									const listItems = Object.entries(
										sppbInSelected?.OrmPOItemSppbIns ?? {},
									);

									return (
										<>
											<div className="flex gap-2 items-center">
												<Select
													control={control}
													className="flex-1"
													key={`${formData.id_customer}${formData.po?.[i]?.id_po}`}
													fieldName={`po.${i}.sppb_in.${ii}.id_sppb_in`}
													label="Surat Jalan Masuk"
													data={selectMapper(
														poSelected?.OrmCustomerSPPBIns ?? [],
														"id",
														"nomor_surat",
													)}
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
												data={listItems}
												header={[
													"Kode Item",
													"Nama Item",
													"Nomor Lot",
													"Nomor Lot IMI",
													"Jumlah",
												]}
												renderItem={({Cell, item: [id_item, item]}) => {
													const masterItemDetail = item.OrmMasterItem;

													const lot_no_imi = sppbInSelected?.OrmKanbans?.map(
														e => e.OrmScans?.[0]?.lot_no_imi,
													).join(" | ");

													const itemInScan = itemInScanParser(
														sppbInSelected?.OrmKanbans,
													);

													return (
														<>
															<Input
																control={control}
																className="hidden"
																defaultValue={masterItemDetail?.id}
																fieldName={`po.${i}.sppb_in.${ii}.items.${id_item}.master_item_id`}
															/>
															<Input
																control={control}
																className="hidden"
																defaultValue={item.OrmCustomerPOItem.id}
																fieldName={`po.${i}.sppb_in.${ii}.items.${id_item}.id_item_po`}
															/>
															<Cell>{masterItemDetail?.name}</Cell>
															<Cell>{masterItemDetail?.kode_item}</Cell>
															<Cell>{item.lot_no}</Cell>
															<Cell>{lot_no_imi}</Cell>
															<Cell className="flex gap-2">
																{qtyMap(({qtyKey, unitKey, num}) => {
																	const jumlah = itemInScan?.[qtyKey];

																	if (!jumlah) return null;

																	return (
																		<Input
																			key={jumlah}
																			type="decimal"
																			shouldUnregister
																			className="flex-1 bg-white"
																			label={`Qty ${num}`}
																			defaultValue={jumlah.toString()}
																			rightAcc={
																				<Text>
																					{item.OrmCustomerPOItem?.[unitKey]}
																				</Text>
																			}
																			fieldName={`po.${i}.sppb_in.${ii}.items.${id_item}.${qtyKey}`}
																			control={control}
																			rules={{
																				max: {
																					value: jumlah,
																					message: `max is ${jumlah}`,
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

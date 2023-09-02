import {FormValue} from "pages/app/customer/customer_sppb_out";
import {useWatch} from "react-hook-form";

import {Wrapper} from "@appComponent/Wrapper";
import {FormProps} from "@appTypes/app.type";
import {Button, Input, Select, selectMapper, Table, Text} from "@components";
import {useSppbOut} from "@hooks";
import type {SppbInRows} from "@trpc/routers/sppb/in";
import type {GetFGRet} from "@trpc/routers/sppb/out";
import {modalTypeParser, qtyMap} from "@utils";

export function SppbOutModalChild({
	control,
	reset,
}: FormProps<FormValue, "control" | "reset">) {
	const formData = useWatch({control});

	const {dataCustomer, dataFg, dataKendaraan, invoiceId} = useSppbOut(
		formData.id_customer,
	);
	const {isDelete} = modalTypeParser(formData.type);

	const selectedCustomer = dataCustomer.find(
		e => e.id === formData.id_customer,
	);
	const availableSppbIn = dataFg.filter(
		e => !!formData?.po?.find(y => y.id_po === e.kanban?.id_po),
	);

	const dataAvailablePo = selectMapper(
		dataFg.filter(
			e => e.kanban.dataSppbIn?.detailPo?.id_customer === formData.id_customer,
		),
		"kanban.id_po",
		"kanban.dataSppbIn.detailPo.nomor_po",
	);

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

			<Button
				onClick={() =>
					reset(prev => {
						const {po = []} = prev;
						return {
							...prev,
							po: [...po, {id_po: "", sppb_in: [{id_sppb_in: "", items: {}}]}],
						};
					})
				}>
				Add PO
			</Button>

			{formData.po?.map((po, i) => {
				const availablePo = dataAvailablePo.filter(
					e =>
						e.value === formData.po![i]!.id_po ||
						!formData.po!.map(y => y.id_po).includes(e.value),
				);
				const availablePoMap = new Map(availablePo.map(u => [u.value, u]));

				return (
					<>
						<div className="flex gap-2">
							<Select
								className="flex-1"
								key={formData.id_customer}
								label="PO"
								control={control}
								fieldName={`po.${i}.id_po`}
								data={[...availablePoMap.values()]}
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
							const selectedSppbIn = availableSppbIn.find(
								e => sppb?.id_sppb_in === e.kanban?.dataSppbIn?.id,
							);

							const listItems = Object.entries(
								selectedSppbIn?.kanban.items ?? {},
							);

							const availableSJ = selectMapper(
								availableSppbIn,
								"kanban.dataSppbIn.id",
								"kanban.dataSppbIn.nomor_surat",
							).filter(
								e =>
									e.value === po.sppb_in?.[ii]?.id_sppb_in ||
									!po.sppb_in?.map(y => y.id_sppb_in).includes(e.value),
							);
							const availableSJMap = new Map(
								availableSJ.map(u => [u.value, u]),
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
											data={[...availableSJMap.values()]}
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
											const sppbInItem =
												selectedSppbIn?.kanban.dataSppbIn?.items?.find(
													e => e.id === id_item,
												);

											const {lot_no} = sppbInItem ?? {};

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
														defaultValue={sppbInItem?.id_item}
														fieldName={`po.${i}.sppb_in.${ii}.items.${id_item}.id_item_po`}
													/>
													<Cell>{masterItemDetail?.name}</Cell>
													<Cell>{masterItemDetail?.kode_item}</Cell>
													<Cell>{lot_no}</Cell>
													<Cell>{item.lot_no_imi}</Cell>
													<Cell className="flex gap-2">
														<RenderJumlah
															i={i}
															ii={ii}
															item={item}
															control={control}
															id_item={id_item}
															sppbInItem={sppbInItem}
														/>
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
	);
}

type RenderJumlahProps = {
	i: number;
	ii: number;
	id_item: string;
	item: GetFGRet["kanban"]["items"][string];
	sppbInItem?: NonNullable<SppbInRows["items"]>[number];
} & FormProps<FormValue>;

function RenderJumlah({
	sppbInItem,
	item,
	control,
	i,
	ii,
	id_item,
}: RenderJumlahProps) {
	const {itemDetail: detail} = sppbInItem ?? {};

	return (
		<>
			{qtyMap(({qtyKey, unitKey, num}) => {
				const jumlah = item[qtyKey];

				if (!jumlah) return null;

				return (
					<Input
						key={jumlah}
						type="decimal"
						className="flex-1 bg-white"
						label={`Qty ${num}`}
						// @ts-ignore
						defaultValue={jumlah}
						rightAcc={<Text>{detail?.[unitKey]}</Text>}
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
		</>
	);
}

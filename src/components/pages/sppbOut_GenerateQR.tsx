// FIXME:
// @ts-nocheck

import {PropsWithChildren} from "react";

import {TInstruksiKanban} from "@appTypes/app.type";
import {Button, RootTable as Table, Text as Txt, TextProps} from "@components";
import {IMIConst} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {useSppbOut} from "@hooks";
import {dateUtils, generatePDF, qtyMap} from "@utils";
import {trpc} from "@utils/trpc";

import {qtyList} from "./ModalChild_po";

const {Td, Tr} = Table;

function Text(props: TextProps) {
	return <Txt {...props} color="black" />;
}

function Section({
	title,
	children,
	mid = ":",
}: PropsWithChildren<{title: string; mid?: string}>) {
	return (
		<div className="flex gap-2 flex-1">
			<Text className="w-1/6">{title}</Text>
			<Text>{mid}</Text>
			<Text className="flex-1">{children}</Text>
		</div>
	);
}

function Sign({children}: PropsWithChildren) {
	return (
		<div className="flex flex-col w-full items-center">
			<Text>{children}</Text>
			<div className="h-16" />
			<div className="flex w-full justify-center">
				<Text>(</Text>
				<div className="w-1/2" />
				<Text>)</Text>
			</div>
		</div>
	);
}

export function SPPBOutGenerateQR(props: {
	id: string;
	className?: string;
	withButton?: boolean;
}) {
	const tagId = `data-${props.id}`;

	const {
		id,
		withButton = true,
		// className = "",
		className = "h-0 overflow-hidden -z-10 fixed",
	} = props;

	// const {data: qrImage} = trpc.qr.useQuery<any, string>(
	// 	{input: id},
	// 	{enabled: !!id},
	// );

	const {data: detail} = trpc.sppb.out.getDetail.useQuery(id, {enabled: !!id});
	const {dataFg} = useSppbOut(detail?.id_customer);

	const doc = dataFg?.[0]?.kanban.OrmDocument;

	function showPdf() {
		generatePDF(tagId, "sppb_out");
	}

	return (
		<>
			{withButton && <Button icon="faPrint" onClick={showPdf} />}

			<div className={className}>
				<div id={tagId} className="w-[900px] flex flex-col gap-2 p-4">
					<div className="flex flex-col gap-2 p-4 border border-black">
						<div className="flex justify-between">
							<div className="flex flex-1 flex-col">
								<Text className="font-extrabold">{IMIConst.name}</Text>
								<Text>{IMIConst.address1}</Text>
								<Text>{IMIConst.address2}</Text>
								<Section title="Phone">{IMIConst.phone}</Section>
								<Section title="Fax">{IMIConst.fax}</Section>
							</div>
							<div className="flex flex-1 flex-col">
								<div className="w-[100px] self-end">
									<img alt="" src="/assets/iso.png" />
								</div>
								<div className="flex gap-4 flex-1">
									<Section title="No. Dok">{doc?.doc_no}</Section>
								</div>
								<Section title="Tgl Efektif">
									{dateUtils.date(doc?.tgl_efektif)}
								</Section>
								<div className="flex gap-4 flex-1">
									<Section title="Revisi">{doc?.revisi}</Section>
									<Section title="Terbit">{doc?.terbit}</Section>
								</div>
							</div>
						</div>
						<div className="flex justify-between">
							<div className="flex-1">
								<Text className="font-extrabold">SURAT JALAN</Text>
								<Section title="Tanggal">
									{dateUtils.date(detail?.date)}
								</Section>
								<Section title="No. D.O.">{detail?.invoice_no}</Section>
								<Section title="Kendaraan">
									{detail?.data.kendaraan?.name}
								</Section>
								<Section title="No. Pol."></Section>
								<Text>
									Harap diterima dengan baik barang-barang dibawah ini
								</Text>
							</div>
							<div className="flex-1 border border-black p-4">
								<Text>Kepada : {detail?.data.customer?.name}</Text>
								<Text>di {detail?.data.customer?.alamat}</Text>
							</div>
						</div>
					</div>
					<div className="border border-black">
						<Table>
							<Tr>
								<Td>No</Td>
								<Td>Nama Barang</Td>
								{qtyList.map(num => (
									<Td key={num}>Qty</Td>
								))}
								<Td>Lot No Customer</Td>
								<Td>Lot No IMI</Td>
								<Td>No PO</Td>
								<Td>No SPPB In</Td>
								<Td>Proses</Td>
							</Tr>

							{detail?.po.map(po => {
								return (
									<>
										{po.sppb_in.map(e => {
											const selectedSppbIn = dataFg.find(
												eee => e.id_sppb_in === eee.kanban?.dataSppbIn?.id,
											);
											return (
												<>
													{Object.entries(e.items).map(
														([id_item, item], index) => {
															const {itemDetail} =
																selectedSppbIn?.kanban.dataSppbIn?.items?.find(
																	eItem => eItem.id === id_item,
																) ?? {};
															const kanban = selectedSppbIn?.kanban;
															const masterItem =
																kanban?.items[id_item]?.OrmMasterItem;
															return (
																<>
																	<Tr>
																		<Td>{index + 1}</Td>
																		{/* FIXME: */}
																		{/* @ts-ignore */}
																		<Td>{masterItem?.name}</Td>
																		{qtyMap(({num, qtyKey, unitKey}) => {
																			return (
																				<Td key={num}>
																					{item[qtyKey]} {itemDetail?.[unitKey]}
																				</Td>
																			);
																		})}
																		<Td>{kanban?.dataSppbIn?.lot_no}</Td>
																		<Td>{selectedSppbIn?.lot_no_imi}</Td>
																		<Td>{kanban?.OrmCustomerPO?.nomor_po}</Td>
																		<Td>
																			{
																				selectedSppbIn?.kanban.dataSppbIn
																					?.nomor_surat
																			}
																		</Td>
																		<Td className="flex-col gap-2">
																			{masterItem?.kategori_mesinn?.map(m => {
																				return masterItem.instruksi[m].map(
																					ins => (
																						<DetailProcess
																							key={ins.id_instruksi}
																							id={ins.id_instruksi}
																						/>
																					),
																				);
																			})}
																		</Td>
																	</Tr>
																</>
															);
														},
													)}
												</>
											);
										})}
									</>
								);
							})}
						</Table>
					</div>
					<div className="flex justify-between gap-2 p-4 border border-black">
						<Sign>Penerima,</Sign>
						<Sign>Kemananan,</Sign>
						<Sign>Mengetahui,</Sign>
						<Sign>Pembuat,</Sign>
					</div>
					<div className="flex gap-2">
						<Text>Putih : Accounting</Text>
						<Text>Merah : Arsip</Text>
						<Text>Kuning : Security</Text>
						<Text>Biru & Hijau : Customer</Text>
					</div>
				</div>
			</div>
		</>
	);
}

function DetailProcess({id}: {id: string}) {
	const {data} = trpc.basic.get.useQuery<any, TInstruksiKanban[]>({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
		where: {id},
	});

	return <Text>{data?.[0]?.name}</Text>;
}

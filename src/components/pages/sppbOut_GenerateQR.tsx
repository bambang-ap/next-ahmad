// FIXME:
// @ts-nochecks

import {PropsWithChildren} from "react";

import {TInstruksiKanban} from "@appTypes/app.type";
import {
	Button,
	RootTable as Table,
	StyledCellProps,
	Text as Txt,
	TextProps,
} from "@components";
import {IMIConst} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {useSppbOut} from "@hooks";
import {
	classNames,
	dateUtils,
	generatePDF,
	paperSizeCalculator,
	qtyMap,
} from "@utils";
import {trpc} from "@utils/trpc";

import {qtyList} from "./ModalChild_po";

const {Tr} = Table;

const font = "font-bold";

function Td({className, ...props}: StyledCellProps) {
	return <Table.Td {...props} className={classNames(font, className)} />;
}

export function TxtBold({className, ...props}: TextProps) {
	return (
		<Txt {...props} color="black" className={classNames(font, className)} />
	);
}

function Section({
	title,
	children,
	mid = ":",
}: PropsWithChildren<{title: string; mid?: string}>) {
	return (
		<div className="flex gap-2 flex-1">
			<TxtBold className="w-1/6">{title}</TxtBold>
			<TxtBold>{mid}</TxtBold>
			<TxtBold className="flex-1">{children}</TxtBold>
		</div>
	);
}

function Sign({children}: PropsWithChildren) {
	return (
		<div className="flex flex-col w-full items-center">
			<TxtBold className={font}>{children}</TxtBold>
			<div className="h-16" />
			<div className="flex w-full justify-center">
				<TxtBold>(</TxtBold>
				<div className="w-1/2" />
				<TxtBold>)</TxtBold>
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

	const [width, height] = paperSizeCalculator(1100, {minus: 1});

	function showPdf() {
		generatePDF(tagId, "sppb_out");
	}

	return (
		<>
			{withButton && <Button icon="faPrint" onClick={showPdf} />}

			<div className={className}>
				<div
					id={tagId}
					style={{width, height}}
					className={classNames("flex flex-col gap-2 p-4", "justify-between")}>
					<div className="flex flex-col gap-2 flex-1">
						<div className="flex flex-col gap-2 p-4 border border-black">
							<div className="flex justify-between">
								<div className="flex flex-1 flex-col">
									<TxtBold className="font-extrabold">{IMIConst.name}</TxtBold>
									<TxtBold>{IMIConst.address1}</TxtBold>
									<TxtBold>{IMIConst.address2}</TxtBold>
									<div>
										<Section title="Phone">{IMIConst.phone}</Section>
										<Section title="Fax">{IMIConst.fax}</Section>
									</div>
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
									<TxtBold className="font-extrabold">SURAT JALAN</TxtBold>
									<Section title="Tanggal">
										{dateUtils.date(detail?.date)}
									</Section>
									<Section title="No. D.O.">{detail?.invoice_no}</Section>
									<Section title="Kendaraan">
										{detail?.OrmKendaraan.name}
									</Section>
									<Section title="No. Pol."></Section>
									<Section title="Keterangan">{detail?.keterangan}</Section>
									<TxtBold>
										Harap diterima dengan baik barang-barang dibawah ini
									</TxtBold>
								</div>
								<div className="flex-1 border border-black p-4">
									<TxtBold>Kepada : {detail?.OrmCustomer.name}</TxtBold>
									<TxtBold>{detail?.OrmCustomer.alamat}</TxtBold>
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
									<Td>Lot No</Td>
									<Td>Lot No IMI</Td>
									<Td>No PO</Td>
									<Td>SJ Masuk</Td>
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
																const {id, itemDetail, lot_no} =
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
																			<Td>{masterItem?.name}</Td>
																			{qtyMap(({num, qtyKey, unitKey}) => {
																				return (
																					<Td key={num}>
																						{item[qtyKey]}{" "}
																						{itemDetail?.[unitKey]}
																					</Td>
																				);
																			})}
																			<Td>{lot_no}</Td>
																			<Td>
																				{kanban?.items?.[id!]?.lot_no_imi}
																			</Td>
																			<Td>{po?.dataPo?.nomor_po}</Td>
																			<Td>{e?.dataSppbIn?.nomor_surat}</Td>
																			<Td className="flex-col gap-2">
																				{masterItem?.kategori_mesinn?.map(m => {
																					// @ts-ignore
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
					</div>
					<div className="flex justify-between gap-2 p-4 border border-black">
						<Sign>Penerima,</Sign>
						<Sign>Keamanan,</Sign>
						<Sign>Mengetahui,</Sign>
						<Sign>Pembuat,</Sign>
					</div>
					<div className="flex gap-2">
						<TxtBold>Putih : Accounting</TxtBold>
						<TxtBold>Merah : Arsip</TxtBold>
						<TxtBold>Kuning : Security</TxtBold>
						<TxtBold>Biru & Hijau : Customer</TxtBold>
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

	return <TxtBold>{data?.[0]?.name}</TxtBold>;
}

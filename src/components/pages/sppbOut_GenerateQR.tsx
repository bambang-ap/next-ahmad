import {PropsWithChildren} from 'react';

import {Wrapper, WrapperProps} from '@appComponent/Wrapper';
import {RouterOutput, TInstruksiKanban} from '@appTypes/app.type';
import {
	BorderTd,
	BorderTdProps,
	RootTable as Table,
	Text as Txt,
	TextProps,
} from '@components';
import {IMIConst} from '@constants';
import {CRUD_ENABLED, REJECT_REASON} from '@enum';
import {
	classNames,
	dateUtils,
	itemInScanParser,
	paperSizeCalculator,
	qtyMap,
} from '@utils';
import {trpc} from '@utils/trpc';

import {qtyList} from './ModalChild_po';

const {Tr} = Table;

const font = 'font-bold';

function Td({className, ...props}: BorderTdProps) {
	return (
		<BorderTd
			{...props}
			rootClassName="!border"
			className={classNames(font, className)}
		/>
	);
}

function Wrp(props: Pick<WrapperProps, 'children' | 'title'>) {
	return (
		<Wrapper
			className="px-0"
			noColon
			transparent
			sizes={['flex-1']}
			{...props}
		/>
	);
}

function Section({
	title,
	children,
	mid = ':',
}: PropsWithChildren<{title: string; mid?: string}>) {
	return (
		<div className="flex gap-2 flex-1">
			<TxtBold className={classNames('w-1/6 font-calibri')}>{title}</TxtBold>
			<TxtBold>{mid}</TxtBold>
			<TxtBold className={classNames('flex-1 font-calibri')}>
				{children}
			</TxtBold>
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

function DetailProcess({id}: {id: string}) {
	const {data} = trpc.basic.get.useQuery<any, TInstruksiKanban[]>({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
		where: {id},
	});

	return <TxtBold>{data?.[0]?.name}</TxtBold>;
}

export function TxtBold({className, ...props}: TextProps) {
	return (
		<Txt {...props} color="black" className={classNames(font, className)} />
	);
}

export function SPPBOutGenerateQR({
	detail,
	width: widthSize,
}: {
	detail?: Partial<RouterOutput['print']['sppb']['out'][number]>;
	width: number;
}) {
	const [width, height] = paperSizeCalculator(widthSize, {minus: 45});

	const tagId = `data-${detail?.id}`;
	const doc = detail?.dOutItems?.[0]?.dInItem?.dSJIn?.dKanbans?.[0]?.dDoc;

	return (
		<div
			id={tagId}
			style={{width, height}}
			className={classNames('flex flex-col gap-2 p-4', 'justify-between')}>
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
							<div className="flex">
								<TxtBold className="font-extrabold">SURAT JALAN</TxtBold>
								<div className="flex flex-1 justify-center">
									<TxtBold className="font-extrabold">
										{detail?.keterangan}
									</TxtBold>
								</div>
							</div>
							<Section title="Tanggal">{dateUtils.date(detail?.date)}</Section>
							<Section title="No. D.O.">{detail?.invoice_no}</Section>
							<Section title="Kendaraan">{detail?.dVehicle?.name}</Section>
							<Section title="No. Pol."></Section>
							<TxtBold>
								Harap diterima dengan baik barang-barang dibawah ini
							</TxtBold>
						</div>
						<div className="flex-1 border border-black p-4">
							<TxtBold>Kepada : {detail?.dCust?.name}</TxtBold>
							<TxtBold>{detail?.dCust?.alamat}</TxtBold>
						</div>
					</div>
				</div>
				<table>
					<Tr>
						<Td center>No</Td>
						<Td center>Nama Barang</Td>
						{qtyList.map(num => (
							<Td center key={num}>
								Qty {num}
							</Td>
						))}
						<Td center>Lot No</Td>
						<Td center>Lot No IMI</Td>
						<Td center>No PO</Td>
						<Td center>SJ Masuk</Td>
						<Td center>Proses</Td>
					</Tr>

					{detail?.dOutItems?.map((itemm, index) => {
						const {dInItem: OrmPOItemSppbIn, ...item} = itemm;
						const {
							dItem: OrmMasterItem,
							dPoItem: OrmCustomerPOItem,
							dSJIn: OrmCustomerSPPBIn,
						} = OrmPOItemSppbIn;
						const lot_no_imi = OrmCustomerSPPBIn?.dKanbans.map(e => {
							const eae = e.dScans
								.map((f, i) => {
									if (e.dKnbItems[i]?.id_item !== itemm.dInItem.id)
										return undefined;

									return f.lot_no_imi;
								})
								.filter(Boolean)
								.join(' | ');

							return eae;
						});

						const {rejectedItems} = itemInScanParser(
							OrmPOItemSppbIn.id,
							OrmCustomerSPPBIn?.dKanbans,
						);

						return (
							<>
								<Tr>
									<Td>{index + 1}</Td>
									<Td>{OrmMasterItem?.name}</Td>
									{qtyMap(({num, qtyKey, unitKey}) => {
										if (!item[qtyKey]) return <Td width={115} />;

										const unit = OrmCustomerPOItem?.[unitKey];
										const qtyRejectRP = rejectedItems.RP?.[qtyKey];
										const qtyRejectTP = rejectedItems.TP?.[qtyKey];

										return (
											<Td width={115} className="flex-col" key={num}>
												<Wrp title={item[qtyKey]?.toString()}>{unit!}</Wrp>
												{!!qtyRejectTP && (
													<Wrp title={REJECT_REASON.TP}>
														{`${qtyRejectTP?.toString()} ${unit}`}
													</Wrp>
												)}
												{!!qtyRejectRP && (
													<Wrp title={REJECT_REASON.RP}>
														{`${qtyRejectRP?.toString()} ${unit}`}
													</Wrp>
												)}
											</Td>
										);
									})}
									<Td>{OrmPOItemSppbIn.lot_no}</Td>
									<Td>{lot_no_imi}</Td>
									<Td>{OrmCustomerPOItem.dPo.nomor_po}</Td>
									<Td>{OrmCustomerSPPBIn.nomor_surat}</Td>
									<Td className="flex-col gap-2">
										{OrmMasterItem?.kategori_mesinn?.map(m => {
											return OrmMasterItem.instruksi[m]!.map(ins => (
												<DetailProcess
													key={ins.id_instruksi}
													id={ins.id_instruksi}
												/>
											));
										})}
									</Td>
								</Tr>
							</>
						);
					})}
				</table>
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
	);
}

import {RouterOutput, TMasterItem} from '@appTypes/app.type';
import {BorderTd, Text as Txt, TextProps} from '@components';
import {nonRequiredRefetch} from '@constants';
import {DataProcess} from '@trpc/routers/kanban/get';
import {classNames, dateUtils, moment, renderIndex} from '@utils';
import {trpc} from '@utils/trpc';

import {TableBorder, TxtBold} from './sppbOut_GenerateQR';

function Text(props: TextProps) {
	return <Txt {...props} color="black" />;
}

type AProps = RouterOutput['print']['kanban'][number];

export function RenderKanbanCardV2(props: AProps) {
	const {id_item, qty1, qty2, qty3, OrmKanban, OrmPOItemSppbIn} = props;
	const {OrmCustomerSPPBIn: dataSppbIn} = OrmPOItemSppbIn;
	const {unit1, unit2, unit3 /* harga */, OrmMasterItem} =
		OrmPOItemSppbIn.OrmCustomerPOItem;
	const {
		createdAt,
		keterangan,
		nomor_kanban,
		list_mesin,
		OrmDocument: docDetail,
		OrmCustomerPO,
		dataCreatedBy,
		id: idKanban,
		// image,
	} = OrmKanban;

	const processes = OrmMasterItem?.instruksi;
	const unit_notes = OrmMasterItem?.unit_notes ?? [];
	const selectedMesin = list_mesin?.[id_item];

	const {data: qrImage} = trpc.qr.useQuery(idKanban, {enabled: !!idKanban});
	const {data: dataMesinProcess} = trpc.kanban.mesinProcess.useQuery(
		{
			process: processes,
			selectedMesin,
		},
		nonRequiredRefetch,
	);

	const borderClassName = 'border-black border-b-2 -mx-2 px-2 pb-2';
	const itemSppbIn = OrmPOItemSppbIn;
	const dateKanban = `Tgl Kanban ${moment(createdAt).format(
		'D MMMM YYYY - HH.mm.ss',
	)}`;

	const {lot_no} = itemSppbIn ?? {};
	const [class1, class2, class3] = [
		classNames('text-2xl', {['text-white']: !qty1 || !unit1}),
		classNames('text-2xl', {['text-white']: !qty2 || !unit2}),
		classNames('text-2xl', {['text-white']: !qty3 || !unit3}),
	] as const;

	type KK = Record<'nomorMesin' | 'process' | 'material', string[]> &
		Pick<DataProcess, 'hardness' | 'parameter'>;

	const rest = dataMesinProcess?.reduce<KK>(
		(ret, mesin) => {
			type I = Omit<DataProcess, 'material' | 'process'> & {
				material: string[];
				process: string[];
			};
			const {nomorMesin, process, material, hardness, parameter} = ret;

			const e = mesin?.dataProcess?.reduce<I>(
				(r, p) => {
					const dM = p.material.map(pp => pp.name);
					const iu = [...process, p.process?.name];
					return {
						...r,
						process: iu,
						material: [...r.material, ...dM],
						hardness: [...r.hardness, ...p.hardness],
						parameter: [...r.parameter, ...p.parameter],
					};
				},
				{hardness: [], material: [], parameter: [], process: []},
			);

			nomorMesin.push(mesin.mesin?.nomor_mesin!);
			return {
				nomorMesin,
				material: [...material, ...e.material],
				process: [...process, ...e.process],
				hardness: [...hardness, ...e.hardness],
				parameter: [...parameter, ...e.parameter],
			};
		},
		{nomorMesin: [], process: [], material: [], hardness: [], parameter: []},
	);

	return (
		<>
			<table className="w-full table-fixed child:font-calibri">
				<tr className="border-0">
					<BorderTd className="text-2xl" rowSpan={2} center>
						IMI
					</BorderTd>
					<BorderTd
						className="text-2xl font-noto-sans"
						rowSpan={2}
						colSpan={3}
						center>
						PROCESSING CARD
					</BorderTd>
					<BorderTd center colSpan={2}>
						{docDetail?.doc_no}
					</BorderTd>
				</tr>
				<tr>
					<BorderTd center>{dateUtils.dateS(docDetail?.tgl_efektif)}</BorderTd>
					<BorderTd>Rev {docDetail?.revisi}</BorderTd>
				</tr>
				<tr>
					<BorderTd className="text-base">Customer</BorderTd>
					<BorderTd colSpan={2}>{OrmCustomerPO?.OrmCustomer?.name}</BorderTd>
					<BorderTd center className="text-base">
						HARDNESS
					</BorderTd>
					<BorderTd center colSpan={2} className="text-base">
						PARAMETER
					</BorderTd>
				</tr>
				<tr>
					<BorderTd className="text-base">PO No</BorderTd>
					<BorderTd colSpan={2}>{OrmCustomerPO?.nomor_po}</BorderTd>
					<BorderTd rowSpan={4}>
						<div className="flex h-full flex-col justify-between">
							{rest?.hardness.mmap(({item: e, isLast}) => (
								<Text
									color="black"
									className={classNames('', {[borderClassName]: !isLast})}
									key={e.id}>
									{e.name}
								</Text>
							))}
						</div>
					</BorderTd>
					<BorderTd rowSpan={4} colSpan={2}>
						<div className="flex h-full flex-col justify-between">
							{rest?.parameter.mmap(({item: e, isLast}) => (
								<div
									className={classNames('flex gap-1', {
										[borderClassName]: !isLast,
									})}
									key={e.id}>
									<Text color="black" className="flex-1">
										{e.OrmParameterKategori.name}
									</Text>
									<Text color="black" className="flex-1">
										{e.name}
									</Text>
								</div>
							))}
						</div>
					</BorderTd>
				</tr>
				<tr>
					<BorderTd className="text-base">DO No</BorderTd>
					<BorderTd colSpan={2}>{dataSppbIn?.nomor_surat}</BorderTd>
				</tr>
				<tr>
					<BorderTd className="text-base">Incoming Date</BorderTd>
					<BorderTd colSpan={2}>
						{moment(dataSppbIn?.tgl).format('D MMMM YYYY')}
					</BorderTd>
				</tr>
				<tr>
					<BorderTd className="text-base">Nomor Kanban</BorderTd>
					<BorderTd colSpan={2}>
						{renderIndex(OrmKanban!, nomor_kanban!)}
					</BorderTd>
				</tr>
				<tr>
					<BorderTd className="text-base">Part No</BorderTd>
					<BorderTd colSpan={2}>{OrmMasterItem?.kode_item}</BorderTd>
					<BorderTd center className="text-base">
						PROCESS
					</BorderTd>
					<BorderTd center className="text-base">
						MATERIAL
					</BorderTd>
					<BorderTd rowSpan={3}>
						<RenderUnitNotes unit_notes={unit_notes} />
					</BorderTd>
					{/* <BorderTd rowSpan={3}>{image && <img alt="" src={image} />}</BorderTd> */}
				</tr>
				<tr>
					<BorderTd className="text-base">Part Name</BorderTd>
					<BorderTd colSpan={2}>{OrmMasterItem?.name}</BorderTd>
					<BorderTd rowSpan={2}>{rest?.process.join(' & ')}</BorderTd>
					<BorderTd rowSpan={2}>{rest?.material.join(' & ')}</BorderTd>
				</tr>
				<tr>
					<BorderTd className="text-base">Lot Customer</BorderTd>
					<BorderTd colSpan={2}>{lot_no}</BorderTd>
				</tr>
				<tr>
					<BorderTd className="text-base">Mesin</BorderTd>
					<BorderTd colSpan={2}>{rest?.nomorMesin?.join(', ')}</BorderTd>
					<BorderTd className="flex-col" colSpan={2} top>
						<Text>Note :</Text>
						<Text>{keterangan}</Text>
					</BorderTd>
					<BorderTd className="flex-col items-center gap-2" rowSpan={3}>
						{!!qrImage && <img src={qrImage as string} alt="" />}
						{idKanban}
					</BorderTd>
				</tr>
				<tr>
					<BorderTd rowSpan={2} className="text-base">
						Qty / Jumlah
					</BorderTd>
					<BorderTd
						rootClassName="max-h-20"
						className={class1}>{`${qty1} ${unit1}`}</BorderTd>
					<BorderTd
						rootClassName="max-h-20"
						className={class2}>{`${qty2} ${unit2}`}</BorderTd>
					<BorderTd colSpan={2} rowSpan={2} rootClassName="!p-0">
						<TableBorder
							unit="px"
							width={0.1}
							className="w-full h-full"
							anotherCss={id => `
								${id} tr:last-child td{border-bottom-width:0;}
								${id} tr td:first-child{border-left-width:0;}
								${id} tr td:last-child{border-right-width:0;}
								${id} tr:first-child td{border-top-width:0}
							`}>
							<tr>
								<BorderTd rowSpan={2}>Item Check ( Visual)</BorderTd>
								<BorderTd colSpan={2}>Incoming</BorderTd>
							</tr>
							<tr>
								<BorderTd>Yes</BorderTd>
								<BorderTd>No</BorderTd>
							</tr>
							<tr>
								<BorderTd>Rust</BorderTd>
								<BorderTd></BorderTd>
								<BorderTd></BorderTd>
							</tr>
							<tr>
								<BorderTd>Deformation</BorderTd>
								<BorderTd></BorderTd>
								<BorderTd></BorderTd>
							</tr>
							<tr>
								<BorderTd>Mixed</BorderTd>
								<BorderTd></BorderTd>
								<BorderTd></BorderTd>
							</tr>
						</TableBorder>
					</BorderTd>
				</tr>
				<tr>
					<BorderTd
						rootClassName="max-h-20"
						className={class3}>{`${qty3} ${unit3}`}</BorderTd>
					<BorderTd rootClassName="max-h-20" className="text-white">
						.
					</BorderTd>
					{/* <BorderTd>Harga : {harga}</BorderTd> */}
				</tr>
			</table>
			<div className="mt-2 flex justify-between">
				<TxtBold>{dateKanban}</TxtBold>
				<TxtBold>{`Created by : ${dataCreatedBy?.name}`}</TxtBold>
			</div>
		</>
	);
}

export function RenderUnitNotes({unit_notes}: Pick<TMasterItem, 'unit_notes'>) {
	return (
		<div className="flex flex-col gap-2">
			{unit_notes.map(([unit, notes], i) => {
				return <Text key={`${i}-${unit}`}>{`1 ${unit} = ${notes}`}</Text>;
			})}
		</div>
	);
}

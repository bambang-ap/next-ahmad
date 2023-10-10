import {Text, Wrapper} from 'pages/app/scan/[route]/list';

import {THardness, TInstruksiKanban, TParameter} from '@appTypes/app.type';
import {gap} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {classNames, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

import {D} from './RenderPdfData';

type Props = {data: D};
type Prop = {rootData: D; data: D['dScanItems'][number]};

export function RenderItems({data}: Props) {
	return (
		<>
			{data.dScanItems.map((item, i) => {
				return <RenderItem key={i} data={item} rootData={data} />;
			})}
		</>
	);
}

export function RenderItem({data: dataItem, rootData: data}: Prop) {
	const knbItem = dataItem?.dKnbItem;

	const masterItem = knbItem?.dItem;

	const process = Object.values(masterItem?.instruksi ?? {})?.[0];
	const detailProcess = process?.[0];

	const {data: qrImageKanban} = trpc.qr.useQuery<any, string>(
		{input: data.id_kanban},
		{enabled: !!data.id_kanban},
	);

	const {data: processData} = trpc.basic.get.useQuery<any, TInstruksiKanban[]>(
		{
			target: CRUD_ENABLED.INSTRUKSI_KANBAN,
			where: JSON.stringify({id: process?.map(e => e.id_instruksi)}),
		},
		{enabled: !!detailProcess},
	);

	const {data: materialData} = trpc.basic.get.useQuery<any, TParameter[]>(
		{
			target: CRUD_ENABLED.MATERIAL,
			where: JSON.stringify({
				id: detailProcess?.material,
			} as Partial<TParameter>),
		},
		{enabled: !!detailProcess},
	);

	const {data: hardnessData} = trpc.basic.get.useQuery<any, THardness[]>(
		{
			target: CRUD_ENABLED.HARDNESS,
			where: JSON.stringify({
				id: detailProcess?.hardness,
			} as Partial<THardness>),
		},
		{enabled: !!detailProcess},
	);

	const selectedSppbInItem = knbItem?.dInItem;
	const selectedSppbIn = selectedSppbInItem?.dSJIn;

	return (
		<>
			<Wrapper title="Nomor Lot">{selectedSppbInItem?.lot_no}</Wrapper>
			<Wrapper title="SPPB In">{selectedSppbIn?.nomor_surat}</Wrapper>
			<Wrapper title="Nomor Kanban">
				{dataItem?.dKnbItem?.dKanban.nomor_kanban}
			</Wrapper>
			<Wrapper title="Nama Barang">{masterItem?.name}</Wrapper>
			<Wrapper title="Part No.">{masterItem?.kode_item}</Wrapper>
			<Wrapper title="Material">
				{materialData?.map(e => e.name).join(', ')}
			</Wrapper>
			<Wrapper title="Hardness">
				{hardnessData?.map(e => e.name).join(', ')}
			</Wrapper>
			<Wrapper title="Hardness Aktual" />
			<Wrapper title="Jumlah">
				{qtyMap(({qtyKey, unitKey}) => {
					const qty = dataItem?.[qtyKey];
					const unit = knbItem?.dInItem?.dPoItem[unitKey];

					if (!qty) return null;

					return `${qty} ${unit}`;
				})
					.filter(Boolean)
					.join(' | ')}
			</Wrapper>

			<div className={classNames('flex min-h-[64px]', gap)}>
				<div className="bg-white flex justify-center flex-1 p-2">
					<Text className="self-center">LINE-PROCESS</Text>
				</div>
				<div className="bg-white flex justify-center flex-1 p-2">
					<Text className="self-center">
						{processData?.map(e => e.name).join(', ')}
					</Text>
				</div>
				<div className={classNames('bg-white flex flex-col flex-1', gap)}>
					<div className="w-1/2 flex self-center">
						<img src={qrImageKanban} alt="" />
					</div>
				</div>
			</div>
		</>
	);
}

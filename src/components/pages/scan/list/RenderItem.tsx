// FIXME:
// @ts-nocheck

import {Text, Wrapper} from "pages/app/scan/[route]/list";

import {
	THardness,
	TInstruksiKanban,
	TKanbanUpsertItem,
	TParameter,
} from "@appTypes/app.type";
import {gap, qtyList} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {classNames} from "@utils";
import {trpc} from "@utils/trpc";

export function RenderItem({
	item: [id_item, item],
}: {
	item: [string, TKanbanUpsertItem];
}) {
	const masterItem = item.OrmMasterItem;

	const process = Object.values(masterItem?.instruksi ?? {})?.[0];
	const detailProcess = process?.[0];

	const {data: qrImageKanban} = trpc.qr.useQuery<any, string>(
		{input: item.id_kanban},
		{enabled: !!item.id_kanban},
	);

	const {data: dataKanban} = trpc.kanban.detail.useQuery(
		item.id_kanban as string,
	);

	const {data: dataSppbIn} = trpc.sppb.in.get.useQuery({
		type: "sppb_in",
		where: {id: dataKanban?.id_sppb_in},
	});

	const {data: dataPo} = trpc.customer_po.get.useQuery({
		type: "customer_po",
		id: dataKanban?.id_po,
	});

	const {data: processData} = trpc.basic.get.useQuery<any, TInstruksiKanban[]>({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
		where: JSON.stringify({id: process?.map(e => e.id_instruksi)}),
	});

	const {data: materialData} = trpc.basic.get.useQuery<any, TParameter[]>({
		target: CRUD_ENABLED.MATERIAL,
		where: JSON.stringify({id: detailProcess?.material} as Partial<TParameter>),
	});

	const {data: hardnessData} = trpc.basic.get.useQuery<any, THardness[]>({
		target: CRUD_ENABLED.HARDNESS,
		where: JSON.stringify({id: detailProcess?.hardness} as Partial<THardness>),
	});

	const selectedSppbIn = dataSppbIn?.[0];
	const selectedSppbInItem = selectedSppbIn?.OrmCustomerPOItems?.find(
		e => e.id === id_item,
	);
	const selectedItem = dataPo?.[0]?.po_item.find(poItem => {
		return (
			poItem.id ===
			selectedSppbIn?.OrmCustomerPOItems?.find(
				sppbInItem => sppbInItem.id === item.id_item,
			)?.id_item
		);
	});

	return (
		<>
			<Wrapper title="Nomor Lot">{selectedSppbInItem?.lot_no}</Wrapper>
			<Wrapper title="SPPB In">{selectedSppbIn?.nomor_surat}</Wrapper>
			<Wrapper title="Nomor Kanban">{dataKanban?.nomor_kanban}</Wrapper>
			<Wrapper title="Nama Barang">{masterItem?.name}</Wrapper>
			<Wrapper title="Part No.">{masterItem?.kode_item}</Wrapper>
			<Wrapper title="Material">
				{materialData?.map(e => e.name).join(", ")}
			</Wrapper>
			<Wrapper title="Hardness">
				{hardnessData?.map(e => e.name).join(", ")}
			</Wrapper>
			<Wrapper title="Hardness Aktual" />
			<Wrapper title="Jumlah">
				{qtyList
					.map(num => {
						const qty = item[`qty${num}`];
						const unit = selectedItem?.[`unit${num}`];

						if (!qty) return null;

						return `${qty} ${unit}`;
					})
					.filter(Boolean)
					.join(" | ")}
			</Wrapper>

			<div className={classNames("flex min-h-[64px]", gap)}>
				<div className="bg-white flex justify-center flex-1 p-2">
					<Text className="self-center">LINE-PROCESS</Text>
				</div>
				<div className="bg-white flex justify-center flex-1 p-2">
					<Text className="self-center">
						{processData?.map(e => e.name).join(", ")}
					</Text>
				</div>
				<div className={classNames("bg-white flex flex-col flex-1", gap)}>
					<div className="w-1/2 flex self-center">
						<img src={qrImageKanban} alt="" />
					</div>
				</div>
			</div>
		</>
	);
}

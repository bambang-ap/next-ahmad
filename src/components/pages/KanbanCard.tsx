import {TdHTMLAttributes} from "react";

import {TKanbanUpsertItem} from "@appTypes/app.type";
import {Text as Txt, TextProps} from "@components";
import {DataProcess} from "@trpc/routers/kanban/get";
import {classNames, dateUtils, moment} from "@utils";
import {trpc} from "@utils/trpc";

import {TxtBold} from "./sppbOut_GenerateQR";

type Props = {
	idKanban: string;
	item: [string, TKanbanUpsertItem];
};

type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
	top?: boolean;
	center?: boolean;
};

export function BorderTd({center, top, className, ...props}: TdProps) {
	return (
		<td
			{...props}
			className={classNames(
				"border-black border-2",
				"flex-1 px-2 py-1",
				"font-semibold",
				"pb-2",
				{["text-center"]: center, ["align-top"]: top},
				className,
			)}
		/>
	);
}

function Text(props: TextProps) {
	return <Txt {...props} color="black" />;
}

export function RenderKanbanCard({idKanban, item: dataItem}: Props) {
	const {data} = trpc.kanban.detail.useQuery(idKanban, {
		enabled: !!idKanban,
	});
	const {data: qrImage} = trpc.qr.useQuery<any, string>(
		{input: idKanban},
		{enabled: !!idKanban},
	);
	const [id_item, item] = dataItem;
	const {
		OrmDocument: docDetail,
		OrmCustomerPO,
		dataCreatedBy,
		dataSppbIn,
		image,
		createdAt,
		keterangan,
		nomor_kanban,
	} = data ?? {};

	const processes = item.OrmMasterItem?.instruksi;
	const selectedMesin = data?.list_mesin?.[id_item];

	const {data: dataMesinProcess} = trpc.kanban.mesinProcess.useQuery({
		process: processes,
		selectedMesin,
	});

	const borderClassName = "border-black border-b-2 -mx-2 px-2 pb-2";
	const itemSppbIn = dataSppbIn?.items?.find(e => e.id === id_item);
	const dateKanban = `Tgl Kanban ${moment(createdAt).format(
		"D MMMM YYYY - HH.mm.ss",
	)}`;

	const {itemDetail, lot_no} = itemSppbIn ?? {};
	const {qty1, qty2, qty3, OrmMasterItem: masterItem} = item;
	const {unit1, unit2, unit3} = itemDetail ?? {};
	const [class1, class2, class3] = [
		classNames({
			["text-white"]: !qty1 || !unit1,
		}),
		classNames({
			["text-white"]: !qty2 || !unit2,
		}),
		classNames({
			["text-white"]: !qty3 || !unit3,
		}),
	] as const;

	type KK = Record<"nomorMesin" | "process" | "material", string[]> &
		Pick<DataProcess, "hardness" | "parameter">;

	const rest = dataMesinProcess?.reduce<KK>(
		(ret, mesin) => {
			type I = Omit<DataProcess, "material" | "process"> & {
				material: string[];
				process: string[];
			};
			const {nomorMesin, process, material, hardness, parameter} = ret;

			const e = mesin?.dataProcess?.reduce<I>(
				(r, p) => {
					const dM = p.material.map(pp => pp.name);
					const iu = [...process, p.process.name];
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
			<table className="w-full table-fixed">
				<tr className="border-0">
					<BorderTd className="text-2xl" rowSpan={2} center>
						IMI
					</BorderTd>
					<BorderTd className="text-2xl" rowSpan={2} colSpan={3} center>
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
					<BorderTd>Customer</BorderTd>
					<BorderTd colSpan={2}>{OrmCustomerPO?.OrmCustomer.name}</BorderTd>
					<BorderTd center>HARDNESS</BorderTd>
					<BorderTd center colSpan={2}>
						PARAMETER
					</BorderTd>
				</tr>
				<tr>
					<BorderTd>Purchase Order No</BorderTd>
					<BorderTd colSpan={2}>{OrmCustomerPO?.nomor_po}</BorderTd>
					<BorderTd rowSpan={4}>
						<div className="flex h-full flex-col justify-between">
							{rest?.hardness.mmap(({item: e, isLast}) => (
								<Text
									color="black"
									className={classNames("", {[borderClassName]: !isLast})}
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
									className={classNames("flex gap-1", {
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
					<BorderTd>Delivery Order No</BorderTd>
					<BorderTd colSpan={2}>{dataSppbIn?.nomor_surat}</BorderTd>
				</tr>
				<tr>
					<BorderTd>Incoming Date</BorderTd>
					<BorderTd colSpan={2}>
						{moment(dataSppbIn?.tgl).format("D MMMM YYYY")}
					</BorderTd>
				</tr>
				<tr>
					<BorderTd>Nomor Kanban</BorderTd>
					<BorderTd colSpan={2}>{nomor_kanban}</BorderTd>
				</tr>
				<tr>
					<BorderTd>Part No</BorderTd>
					<BorderTd colSpan={2}>{masterItem?.kode_item}</BorderTd>
					<BorderTd colSpan={2} className="text-center">
						PROCESS
					</BorderTd>
					<BorderTd className="text-center">MATERIAL</BorderTd>
				</tr>
				<tr>
					<BorderTd>Part Name</BorderTd>
					<BorderTd colSpan={2}>{masterItem?.name}</BorderTd>
					<BorderTd rowSpan={2} colSpan={2}>
						{rest?.process.join(" & ")}
					</BorderTd>
					<BorderTd rowSpan={2}>{rest?.material.join(" & ")}</BorderTd>
				</tr>
				<tr>
					<BorderTd>Lot Customer</BorderTd>
					<BorderTd colSpan={2}>{lot_no}</BorderTd>
				</tr>
				<tr>
					<BorderTd>Mesin</BorderTd>
					<BorderTd colSpan={2}>{rest?.nomorMesin?.join(", ")}</BorderTd>
					<BorderTd rowSpan={3} top>
						<Text>Keterangan :</Text>
						<Text>{keterangan}</Text>
					</BorderTd>
					<BorderTd rowSpan={3}>{image && <img alt="" src={image} />}</BorderTd>
					<BorderTd rowSpan={3}>
						<img src={qrImage} alt="" />
					</BorderTd>
				</tr>
				<tr>
					<BorderTd rowSpan={2}>Qty / Jumlah</BorderTd>
					<BorderTd className={class1}>{`${qty1} ${unit1}`}</BorderTd>
					<BorderTd className={class2}>{`${qty2} ${unit2}`}</BorderTd>
				</tr>
				<tr>
					<BorderTd className={class3}>{`${qty3} ${unit3}`}</BorderTd>
					<BorderTd className="text-white">~</BorderTd>
				</tr>
			</table>
			<div className="mt-2 flex justify-between">
				<TxtBold>{dateKanban}</TxtBold>
				<TxtBold>{`Created by : ${dataCreatedBy?.name}`}</TxtBold>
			</div>
		</>
	);
}

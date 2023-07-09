import {TdHTMLAttributes} from "react";

import moment from "moment";

import {TKanbanUpsertItem} from "@appTypes/app.type";
import {Text as Txt, TextProps} from "@components";
import {DataProcess} from "@trpc/routers/kanban/get";
import {classNames, dateUtils} from "@utils";
import {trpc} from "@utils/trpc";

type Props = {
	idKanban: string;
	item: [string, TKanbanUpsertItem];
};

type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
	top?: boolean;
	center?: boolean;
};

function Td({center, top, className, ...props}: TdProps) {
	return (
		<td
			{...props}
			className={classNames(
				"border flex-1 px-2 py-1",
				{["text-center"]: center, ["align-top"]: top},
				className,
			)}
		/>
	);
}

function Text(props: TextProps) {
	return <Txt {...props} color="black" />;
}

function RenderKanbanCard({idKanban, item: dataItem}: Props) {
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
	} = data ?? {};

	const process = item.OrmMasterItem?.instruksi;
	const selectedMesin = data?.list_mesin?.[id_item];

	const {data: dataMesinProcess} = trpc.kanban.mesinProcess.useQuery({
		process,
		selectedMesin,
	});

	const itemSppbIn = dataSppbIn?.items?.find(e => e.id === id_item);
	const dateKanban = `Tgl Kanban ${moment(createdAt).format(
		"D MMMM YYYY - HH.mm.ss",
	)}`;

	const {itemDetail, lot_no} = itemSppbIn ?? {};
	const {qty1, qty2, qty3, qty4, id: idItem, OrmMasterItem: masterItem} = item;
	const {unit1, unit2, unit3, unit4} = itemDetail ?? {};
	const [class1, class2, class3, class4] = [
		classNames({
			["text-white"]: !qty1 || !unit1,
		}),
		classNames({
			["text-white"]: !qty2 || !unit2,
		}),
		classNames({
			["text-white"]: !qty3 || !unit3,
		}),
		classNames({
			["text-white"]: !qty4 || !unit4,
		}),
	];

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

			nomorMesin.push(mesin?.mesin?.nomor_mesin);
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
					<Td rowSpan={2}>IMI</Td>
					<Td rowSpan={2} colSpan={3} center>
						PROCESSING CARD
					</Td>
					<Td colSpan={2}>{docDetail?.doc_no}</Td>
				</tr>
				<tr>
					<Td>{dateUtils.dateS(docDetail?.tgl_efektif)}</Td>
					<Td>Rev {docDetail?.revisi}</Td>
				</tr>
				<tr>
					<Td>Customer</Td>
					<Td colSpan={2}>{OrmCustomerPO?.OrmCustomer.name}</Td>
					<Td>HARDNESS</Td>
					<Td colSpan={2}>PARAMETER</Td>
				</tr>
				<tr>
					<Td>Purchase Order No</Td>
					<Td colSpan={2}>{OrmCustomerPO?.nomor_po}</Td>
					<Td rowSpan={3}>
						<div className="flex h-full flex-col justify-between">
							{rest?.hardness.map(e => (
								<Text color="black" className="border-0 border-b-2" key={e.id}>
									{e.name}
								</Text>
							))}
						</div>
					</Td>
					<Td rowSpan={3} colSpan={2}>
						<div className="flex h-full flex-col justify-between">
							{rest?.parameter.map(e => (
								<div className="flex gap-1 border-0 border-b-2" key={e.id}>
									<Text color="black" className="flex-1">
										{e.OrmParameterKategori.name}
									</Text>
									<Text color="black" className="flex-1">
										{e.name}
									</Text>
								</div>
							))}
						</div>
					</Td>
				</tr>
				<tr>
					<Td>Delivery Order No</Td>
					<Td colSpan={2}>{dataSppbIn?.nomor_surat}</Td>
				</tr>
				<tr>
					<Td>Incoming Date</Td>
					<Td colSpan={2}>{moment(dataSppbIn?.tgl).format("D MMMM YYYY")}</Td>
				</tr>
				<tr>
					<Td>Part No</Td>
					<Td colSpan={2}>{masterItem?.kode_item}</Td>
					<Td colSpan={2}>PROCESS</Td>
					<Td>MATERIAL</Td>
				</tr>
				<tr>
					<Td>Part Name</Td>
					<Td colSpan={2}>{masterItem?.name}</Td>
					<Td rowSpan={2} colSpan={2}>
						{rest?.process.join(" & ")}
					</Td>
					<Td rowSpan={2}>{rest?.material.join(" & ")}</Td>
				</tr>
				<tr>
					<Td>Lot Customer</Td>
					<Td colSpan={2}>{lot_no}</Td>
				</tr>
				<tr>
					<Td>Mesin</Td>
					<Td colSpan={2}>{rest?.nomorMesin?.join(", ")}</Td>
					<Td rowSpan={3} top>
						<Text>Keterangan :</Text>
						<Text>{keterangan}</Text>
					</Td>
					<Td rowSpan={3}>{image && <img alt="" src={image} />}</Td>
					<Td rowSpan={3}>
						<img src={qrImage} alt="" />
					</Td>
				</tr>
				<tr>
					<Td rowSpan={2}>Qty / Jumlah</Td>
					<Td className={class1}>{`${qty1} ${unit1}`}</Td>
					<Td className={class2}>{`${qty2} ${unit2}`}</Td>
				</tr>
				<tr>
					<Td className={class3}>{`${qty3} ${unit3}`}</Td>
					<Td className={class4}>{`${qty4} ${unit4}`}</Td>
				</tr>
			</table>
			<div className="mt-2 flex justify-between">
				<Text>{dateKanban}</Text>
				<Text>{`Created by : ${dataCreatedBy?.name}`}</Text>
			</div>
		</>
	);
}

export function RenderPerKanban({
	idKanban,
}: Pick<Props, "idKanban">): JSX.Element | null {
	const {data} = trpc.kanban.detail.useQuery(idKanban, {
		enabled: !!idKanban,
	});

	const {items = {}} = data ?? {};

	if (!data?.id) return null;

	return (
		<>
			{Object.entries(items).map(item => {
				return (
					<RenderKanbanCard idKanban={idKanban} key={item[0]} item={item} />
				);
			})}
		</>
	);
}

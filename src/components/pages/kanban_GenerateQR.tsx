import {TdHTMLAttributes, useEffect, useRef, useState} from "react";

import moment from "moment";
import {KanbanFormType} from "pages/app/kanban";
import {useForm} from "react-hook-form";

import {KanbanGetRow, TKanbanUpsertItem} from "@appTypes/app.type";
import {
	Button,
	Icon,
	Modal,
	ModalRef,
	RootTable as Table,
	Text,
} from "@components";
import {classNames, dateUtils, generatePDF} from "@utils";
import {trpc} from "@utils/trpc";

const {Tr, Td} = Table;

function Ttd({className, ...props}: TdHTMLAttributes<HTMLTableCellElement>) {
	return <td {...props} className={classNames("border flex-1", className)} />;
}

export function KanbanGenerateQR({
	idKanban,
	...props
}: {
	idKanban: string;
	className?: string;
	transform?: boolean;
	withButton?: boolean;
}) {
	const modalRef = useRef<ModalRef>(null);
	const tagId = `data-${idKanban}`;

	const [visible, setVisible] = useState(false);

	const {reset, control} = useForm<KanbanFormType>();

	const {data} = trpc.kanban.detail.useQuery(idKanban, {
		enabled: !!idKanban && visible,
	});
	const {data: qrImage} = trpc.qr.useQuery<any, string>(
		{input: idKanban},
		{enabled: !!idKanban && visible},
	);

	const {
		// className = "h-0 overflow-hidden -z-10 fixed",
		className = "",
		withButton = true,
	} = props;

	const {items = {}} = data ?? {};

	function showModal() {
		modalRef.current?.show();
	}

	function genPdf() {
		if (visible && !!data) {
			setTimeout(async () => {
				await generatePDF(tagId, "kanban");
				modalRef.current?.hide();
			}, 1000);
		}
	}

	useEffect(() => {
		// genPdf();
	}, [visible, !!data]);

	useEffect(() => {
		if (data) reset(data);
	}, [!!data]);

	return (
		<>
			<Modal ref={modalRef} onVisibleChange={setVisible}>
				<div className="w-full flex justify-center items-center gap-2">
					<Icon name="faSpinner" className="animate-spin" />
					<Text>Harap Tunggu...</Text>
				</div>
				<div className={className}>
					<div id={tagId} className="flex flex-col gap-2 p-4 w-[500px]">
						{Object.entries(items).map(item => {
							return (
								<Asd key={item[0]} data={data} qrImage={qrImage} item={item} />
							);
						})}
					</div>
				</div>
			</Modal>
			{withButton && <Button icon="faPrint" onClick={showModal} />}
		</>
	);
}

type Props = {
	qrImage?: string;
	data?: KanbanGetRow | null;
	item: [string, TKanbanUpsertItem];
};

function useAsd({data, item: [id_item, item]}: Omit<Props, "qrImage">) {
	const process = item.OrmMasterItem?.instruksi;
	const selectedMesin = data?.list_mesin?.[id_item];

	const {data: dataMesinProcess} = trpc.kanban.mesinProcess.useQuery({
		process,
		selectedMesin,
	});

	console.log(dataMesinProcess);
}

function Asd({data, qrImage, item: dataItem}: Props) {
	const [id_item, item] = dataItem;
	const {
		OrmDocument: docDetail,
		OrmCustomerPO,
		dataCreatedBy,
		dataSppbIn,
		image,
		createdAt,
		keterangan,
		list_mesin,
	} = data ?? {};

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

	const e = useAsd({data, item: dataItem});

	// console.log({u, list_mesin, listMesin, id_item, selectedMesin});

	return (
		<>
			<table className="w-full table-fixed">
				<tr className="border-0">
					<Ttd rowSpan={2}>IMI</Ttd>
					<Ttd rowSpan={2} colSpan={3}>
						PROCESSING CARD
					</Ttd>
					<Ttd colSpan={2}>{docDetail?.doc_no}</Ttd>
				</tr>
				<tr>
					<Ttd>{dateUtils.dateS(docDetail?.tgl_efektif)}</Ttd>
					<Ttd>Rev {docDetail?.revisi}</Ttd>
				</tr>
				<tr>
					<Ttd>Customer</Ttd>
					<Ttd colSpan={2}>{OrmCustomerPO?.OrmCustomer.name}</Ttd>
					<Ttd>HARDNESS</Ttd>
					<Ttd colSpan={2}>PARAMETER</Ttd>
				</tr>
				<tr>
					<Ttd>Purchase Order No</Ttd>
					<Ttd colSpan={2}>{OrmCustomerPO?.nomor_po}</Ttd>
					<Ttd></Ttd>
					<Ttd></Ttd>
					<Ttd></Ttd>
				</tr>
				<tr>
					<Ttd>Delivery Order No</Ttd>
					<Ttd colSpan={2}>{dataSppbIn?.nomor_surat}</Ttd>
					<Ttd></Ttd>
					<Ttd></Ttd>
					<Ttd></Ttd>
				</tr>
				<tr>
					<Ttd>Incoming Date</Ttd>
					<Ttd colSpan={2}>{moment(dataSppbIn?.tgl).format("D MMMM YYYY")}</Ttd>
					<Ttd></Ttd>
					<Ttd></Ttd>
					<Ttd></Ttd>
				</tr>
				<tr>
					<Ttd>Part No</Ttd>
					<Ttd colSpan={2}>{masterItem?.kode_item}</Ttd>
					<Ttd colSpan={2}>PROCESS</Ttd>
					<Ttd>MATERIAL</Ttd>
				</tr>
				<tr>
					<Ttd>Part Name</Ttd>
					<Ttd colSpan={2}>{masterItem?.name}</Ttd>
					<Ttd rowSpan={2} colSpan={2}>
						(process)
					</Ttd>
					<Ttd rowSpan={2}>(material)</Ttd>
				</tr>
				<tr>
					<Ttd>Lot Customer</Ttd>
					<Ttd colSpan={2}>{lot_no}</Ttd>
				</tr>
				<tr>
					<Ttd>Mesin</Ttd>
					<Ttd colSpan={2}>(nomor mesin)</Ttd>
					<Ttd rowSpan={3}>Keterangan : {keterangan}</Ttd>
					<Ttd rowSpan={3}>{image && <img alt="" src={image} />}</Ttd>
					<Ttd rowSpan={3}>
						<img src={qrImage} alt="" />
					</Ttd>
				</tr>
				<tr>
					<Ttd rowSpan={2}>Qty / Jumlah</Ttd>
					<Ttd className={class1}>{`${qty1} ${unit1}`}</Ttd>
					<Ttd className={class2}>{`${qty2} ${unit2}`}</Ttd>
				</tr>
				<tr>
					<Ttd className={class3}>{`${qty3} ${unit3}`}</Ttd>
					<Ttd className={class4}>{`${qty4} ${unit4}`}</Ttd>
				</tr>
			</table>
			<div className="flex justify-between">
				<Text>{dateKanban}</Text>
				<Text>{`Created by : ${dataCreatedBy?.name}`}</Text>
			</div>
		</>
	);
}

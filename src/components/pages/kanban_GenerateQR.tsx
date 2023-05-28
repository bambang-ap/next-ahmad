import {Fragment, useEffect, useRef, useState} from "react";

import {FormType} from "pages/app/kanban";
import {useForm} from "react-hook-form";

import {
	Button,
	Form,
	Icon,
	Modal,
	ModalRef,
	RootTable as Table,
	Text,
} from "@components";
import {qtyList} from "@constants";
import {dateUtils, generatePDF} from "@utils";
import {trpc} from "@utils/trpc";

import {RenderMesin} from "./kanban_ModalChild/RenderMesin";

const {Td, Tr} = Table;

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

	const {reset, control} = useForm<FormType>();

	const {data} = trpc.kanban.detail.useQuery(idKanban, {
		enabled: !!idKanban && visible,
	});
	const {data: qrImage} = trpc.qr.useQuery<any, string>(
		{input: idKanban},
		{enabled: !!idKanban && visible},
	);

	const {
		className = "h-0 overflow-hidden -z-10 fixed",
		// className = "",
		transform = true,
		withButton = true,
	} = props;

	const {
		OrmDocument: docDetail,
		OrmCustomerPO,
		dataCreatedBy,
		items = {},
		dataSppbIn,
		image,
		createdAt,

		keterangan,
	} = data ?? {};

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
		// FIXME: Saat print, bagian input jadi hitam
		genPdf();
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
					<div id={tagId} className="flex flex-col gap-2 p-4 w-[800px]">
						<Table>
							<Tr>
								<Td colSpan={2}>
									<img src={qrImage} alt="" />
								</Td>
								<Td colSpan={2} className="flex-col gap-2">
									<div className="p-2 border rounded-md">
										<Text>Doc no : {docDetail?.doc_no}</Text>
										<Text>Keterangan : {docDetail?.keterangan}</Text>
									</div>
									<Text>tgl kanban : {dateUtils.full(createdAt)}</Text>
									<Text>tgl sj masuk : {dateUtils.date(dataSppbIn?.tgl)}</Text>
								</Td>
							</Tr>
							<Tr>
								<Td colSpan={2} className="flex-col gap-2">
									<Text>no po : {OrmCustomerPO?.nomor_po}</Text>
									<Text>no sj masuk : {dataSppbIn?.nomor_surat}</Text>
									<Text>no cust lot : {dataSppbIn?.lot_no}</Text>
								</Td>
								<Td colSpan={2} className="flex-col gap-2">
									<Text>created by : {dataCreatedBy?.name}</Text>
									<Text>customer : {OrmCustomerPO?.OrmCustomer.name}</Text>
								</Td>
							</Tr>
						</Table>

						<Table>
							<Table.Tr>
								<Table.Td>kode_item</Table.Td>
								<Table.Td>name</Table.Td>
								<Table.Td colSpan={qtyList.length}>Jumlah</Table.Td>
							</Table.Tr>

							{Object.entries(items).map(([, item]) => {
								const {id: idItem, OrmMasterItem, id_item} = item;
								const itemDetail = dataSppbIn?.items?.find(
									e => e.id === id_item,
								)?.itemDetail;

								return (
									<Fragment key={idItem}>
										<Table.Tr>
											<Table.Td>{OrmMasterItem?.kode_item}</Table.Td>
											<Table.Td>{OrmMasterItem?.name}</Table.Td>
											<Td colSpan={2} className="flex-col gap-2">
												{qtyList.map(num => {
													const qtyKey = `qty${num}` as const;
													const unitKey = `unit${num}` as const;
													const qty = item[qtyKey];

													if (!qty) return null;

													return (
														<Text key={num}>
															{qty} {itemDetail?.[unitKey]}
														</Text>
													);
												})}
											</Td>
										</Table.Tr>
										<Table.Tr>
											<Table.Td colSpan={3}>
												<Form className="bg-white" context={{disabled: true}}>
													<RenderMesin
														reset={reset}
														control={control}
														masterId={item.master_item_id}
														idItem={id_item}
													/>
												</Form>
											</Table.Td>
										</Table.Tr>
									</Fragment>
								);
							})}
						</Table>

						<Table>
							<Tr>
								<Td colSpan={4}>Keterangan : {keterangan}</Td>
							</Tr>
							{image && (
								<Tr>
									<Td colSpan={4} className="flex justify-center">
										<div className="w-1/2">
											<img alt="" src={image} />
										</div>
									</Td>
								</Tr>
							)}
						</Table>
					</div>
				</div>
			</Modal>
			{withButton && <Button icon="faPrint" onClick={showModal} />}
		</>
	);
}

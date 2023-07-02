import {Fragment, useEffect, useRef, useState} from "react";

import {KanbanFormType} from "pages/app/kanban";
import {useForm} from "react-hook-form";

import {Wrapper} from "@appComponent/Wrapper";
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

	const {reset, control} = useForm<KanbanFormType>();

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
					<div id={tagId} className="flex flex-col gap-2 p-4 w-[1000px]">
						<Table>
							<Tr>
								<Td colSpan={2}>
									<img src={qrImage} alt="" />
								</Td>
								<Td colSpan={2} className="flex-col gap-2">
									<div className="p-2 border rounded-md">
										<Wrapper title="Doc no">{docDetail?.doc_no}</Wrapper>
										<Wrapper title="Keterangan">
											{docDetail?.keterangan}
										</Wrapper>
									</div>
									<Wrapper title="Tgl Kanban">
										{dateUtils.full(createdAt)}
									</Wrapper>
									<Wrapper title="Tgl SPPB In">
										{dateUtils.date(dataSppbIn?.tgl)}
									</Wrapper>
								</Td>
							</Tr>
							<Tr>
								<Td colSpan={4} className="flex-col gap-2">
									<Wrapper title="Nomor PO">{OrmCustomerPO?.nomor_po}</Wrapper>
									<Wrapper title="Nomor SPPB In">
										{dataSppbIn?.nomor_surat}
									</Wrapper>
									<Wrapper title="Created By">{dataCreatedBy?.name}</Wrapper>
									<Wrapper title="Customer">
										{OrmCustomerPO?.OrmCustomer.name}
									</Wrapper>
								</Td>
							</Tr>
						</Table>

						<Table>
							<Tr>
								<Td>Kode Item</Td>
								<Td>Nama Item</Td>
								<Td>Nomor Lot</Td>
								<Td colSpan={qtyList.length}>Jumlah</Td>
							</Tr>

							{Object.entries(items).map(([, item]) => {
								const {id: idItem, OrmMasterItem, id_item} = item;
								const itemSppbIn = dataSppbIn?.items?.find(
									e => e.id === id_item,
								);
								const {itemDetail, lot_no} = itemSppbIn ?? {};

								return (
									<Fragment key={idItem}>
										<Tr>
											<Td>{OrmMasterItem?.kode_item}</Td>
											<Td>{OrmMasterItem?.name}</Td>
											<Td>{lot_no}</Td>
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
										</Tr>
										<Tr>
											<Td colSpan={3}>
												<Form className="bg-white" context={{disabled: true}}>
													<RenderMesin
														reset={reset}
														control={control}
														masterId={item.master_item_id}
														idItem={id_item}
													/>
												</Form>
											</Td>
										</Tr>
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

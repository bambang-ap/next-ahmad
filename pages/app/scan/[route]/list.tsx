import {PropsWithChildren, useEffect, useRef} from "react";

import {useRouter} from "next/router";
import {KanbanFormType} from "pages/app/kanban";
import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import {
	THardness,
	TInstruksiKanban,
	TKanbanUpsertItem,
	TParameter,
} from "@appTypes/app.type";
import {
	Button,
	Cells,
	Form,
	Modal,
	ModalRef,
	TableFilter,
	Text,
} from "@components";
import {qtyList} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {getLayout} from "@hoc";
import {useKanban, useTableFilter} from "@hooks";
import {KanbanModalChild} from "@pageComponent/kanban_ModalChild";
import {atomHeaderTitle} from "@recoil/atoms";
import type {ScanList} from "@trpc/routers/scan";
import {
	classNames,
	dateUtils,
	generatePDF,
	modalTypeParser,
	scanMapperByStatus,
} from "@utils";
import {trpc} from "@utils/trpc";

import {Route} from "./";

ListScanData.getLayout = getLayout;

export default function ListScanData() {
	useKanban();

	const modalRef = useRef<ModalRef>(null);
	const setTitle = useSetRecoilState(atomHeaderTitle);

	const {isReady, ...router} = useRouter();
	const {route} = router.query as Route;

	const {formValue, hookForm} = useTableFilter();
	const {data} = trpc.scan.list.useQuery({
		...formValue,
		target: route,
	});

	const {control, watch, reset} = useForm<KanbanFormType>();

	const [modalType] = watch(["type"]);

	const {isPreview, modalTitle} = modalTypeParser(modalType);

	function preview(id: string) {
		// setIdKanban(id);
		reset({id, type: "preview"});
		modalRef.current?.show();
	}

	useEffect(() => {
		if (isReady && route) {
			const routeTitle = route.split("_").join(" ").ucwords();
			setTitle(`List ${routeTitle}`);
		}
	}, [isReady, route]);

	if (!isReady) return null;

	return (
		<>
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form context={{disabled: isPreview, hideButton: isPreview}}>
					<KanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>

			<TableFilter
				data={data}
				form={hookForm}
				header={["Tanggal", "Nomor Kanban", "Keterangan", "Action"]}
				renderItem={item => {
					return (
						<RenderData key={item.item.id_kanban} route={route} {...item}>
							<Button
								icon="faMagnifyingGlass"
								onClick={() => preview(item.item.id_kanban)}
							/>
						</RenderData>
					);
				}}
			/>
		</>
	);
}

function RenderData({
	Cell,
	item,
	route,
	children,
}: PropsWithChildren<MMapValue<ScanList> & Cells & Route>) {
	const {data} = trpc.kanban.detail.useQuery(item.id_kanban as string);

	// const document = item.OrmDocument;
	const tagId = `SCAN-${item.id_kanban}`;
	const items = Object.entries(data?.items ?? {});
	const [, , , , /* formName */ cardName] = scanMapperByStatus(route);
	// const formId = ["IMI", "FORM", formName, item.number]
	// 	.filter(Boolean)
	// 	.join("/");

	function printData() {
		generatePDF(tagId, `${route}-${item.id_kanban}`);
	}

	return (
		<>
			<Cell>{dateUtils.date(data?.createdAt)}</Cell>
			<Cell>{data?.nomor_kanban}</Cell>
			<Cell>{data?.keterangan}</Cell>
			<Cell className="flex gap-2">
				{children}
				{route === "qc" && (
					<>
						<Button icon="faPrint" onClick={printData} />
						<div classNdame="h-0 overflow-hidden -z-10 fixed">
							<div
								id={tagId}
								className={classNames(
									"flex flex-col w-[500px] bg-black",
									gap,
									padding,
								)}>
								<div className={classNames("flex", gap)}>
									<div className="bg-white flex justify-center flex-1 p-2">
										<Text className="self-center text-4xl text-center">
											IMI
										</Text>
									</div>
									<div className="bg-white flex justify-center flex-1 p-2">
										<Text className="self-center text-xl text-center">
											{cardName}
										</Text>
									</div>
									<div className={classNames("flex flex-col flex-1", gap)}>
										<div className="bg-white flex justify-center flex-1 p-2">
											<Text className="self-center">IMI/FORM/QC/01-14</Text>
											{/* <Text className="self-center">{formId}</Text> */}
										</div>
										<div className="bg-white flex justify-center flex-1 p-1">
											<Text className="self-center">Revisi : 0</Text>
										</div>
										<div className="bg-white flex justify-center flex-1 p-1">
											<Text className="self-center">Terbit : A</Text>
										</div>
									</div>
								</div>

								<Wrapper title="Customer">
									{data?.OrmCustomerPO?.OrmCustomer.name}
								</Wrapper>
								<Wrapper title="Tgl / Bln / Thn">
									{dateUtils.date(data?.createdAt)}
								</Wrapper>
								{items.map(item => (
									<RenderItem key={item[0]} item={item} />
								))}
							</div>
						</div>
					</>
				)}
			</Cell>
		</>
	);
}

function RenderItem({
	item: [id_item, item],
}: {
	item: [string, TKanbanUpsertItem];
}) {
	const masterItem = item.OrmMasterItem;

	const process = Object.values(masterItem?.instruksi ?? {})?.[0];
	const detailProcess = process?.[0];

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

	const {data: parameterData} = trpc.basic.get.useQuery<any, TParameter[]>({
		target: CRUD_ENABLED.PARAMETER,
		where: JSON.stringify({
			id: detailProcess?.parameter,
		} as Partial<TParameter>),
	});

	const selectedSppbIn = dataSppbIn?.[0];
	const selectedItem = dataPo?.[0]?.po_item.find(poItem => {
		return (
			poItem.id ===
			selectedSppbIn?.items?.find(sppbInItem => sppbInItem.id === item.id_item)
				?.id_item
		);
	});

	return (
		<>
			<Wrapper title="SPPB In">{selectedSppbIn?.nomor_surat}</Wrapper>
			<Wrapper title="Nama Barang">{masterItem?.name}</Wrapper>
			<Wrapper title="Part No.">{masterItem?.kode_item}</Wrapper>
			<Wrapper title="Material">
				{materialData?.map(e => e.name).join(", ")}
			</Wrapper>
			<Wrapper title="Hardness">
				{hardnessData?.map(e => e.name).join(", ")}
			</Wrapper>
			<Wrapper title="Parameter">
				{parameterData?.map(e => e.name).join(", ")}
			</Wrapper>
			<Wrapper title="Jumlah">
				{qtyList
					.map(num => {
						const qty = item[`qty${num}`];
						const unit = selectedItem?.[`unit${num}`];

						if (!qty) return null;

						return `${qty} ${unit}`;
					})
					.filter(Boolean)
					.join(", ")}
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
				<div className={classNames("bg-white flex flex-col flex-1", gap)} />
			</div>
		</>
	);
}

function Wrapper({
	title,
	children,
}: Partial<Record<"title" | "children", string | null>>) {
	return (
		<div className={classNames("flex", gap)}>
			<Text className={classNames("bg-white w-1/4 p-2")}>{title}</Text>
			<Text className={classNames("bg-white p-2 px-4")}>:</Text>
			<Text className={classNames("bg-white flex-1 p-2")}>{children}</Text>
		</div>
	);
}

const spacing = 1;
const gap = `gap-[${spacing}px]`;
const padding = `p-[${spacing}px]`;

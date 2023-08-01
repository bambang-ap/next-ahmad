import {PropsWithChildren, useEffect, useRef} from "react";

import moment from "moment";
import {useRouter} from "next/router";
import {KanbanFormType as KanbanFormTypee} from "pages/app/kanban";
import {Control, useForm, useWatch} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import {
	GeneratePdf,
	GenPdfRef,
	SelectAllButton,
} from "@appComponent/GeneratePdf";
import {Wrapper as Wrp, WrapperProps} from "@appComponent/Wrapper";
import {
	KanbanGetRow,
	THardness,
	TInstruksiKanban,
	TKanbanUpsertItem,
	TParameter,
} from "@appTypes/app.type";
import {
	Button,
	Cells,
	CellSelect,
	Form,
	Modal,
	ModalRef,
	TableFilter,
} from "@components";
import {cuttingLineClassName, qtyList} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {getLayout} from "@hoc";
import {useKanban, useLoader, useTableFilter} from "@hooks";
import {KanbanModalChild} from "@pageComponent/kanban_ModalChild";
import {TxtBold} from "@pageComponent/sppbOut_GenerateQR";
import {atomHeaderTitle} from "@recoil/atoms";
import type {ScanList} from "@trpc/routers/scan";
import {
	classNames,
	dateUtils,
	modalTypeParser,
	scanMapperByStatus,
} from "@utils";
import {trpc} from "@utils/trpc";

import {Route} from "./";

ListScanData.getLayout = getLayout;
const Text = TxtBold;
export type ScanListFormType = KanbanFormTypee;

export default function ListScanData() {
	useKanban();

	const loader = useLoader();
	const modalRef = useRef<ModalRef>(null);
	const genPdfRef = useRef<GenPdfRef>(null);
	const setTitle = useSetRecoilState(atomHeaderTitle);

	const {isReady, ...router} = useRouter();
	const {route} = router.query as Route;

	const {formValue, hookForm} = useTableFilter();
	const {data} = trpc.scan.list.useQuery({
		...formValue,
		target: route,
	});

	const {control, watch, reset} = useForm<ScanListFormType>();

	const formData = watch();

	// console.log(formData)

	const {type: modalType} = formData;

	const {isPreview, isSelect, modalTitle} = modalTypeParser(modalType);

	const idKanbans = Object.entries(formData.idKanbans ?? {}).reduce<string[]>(
		(ret, [id, val]) => {
			if (val) ret.push(id);
			return ret;
		},
		[],
	);

	function preview(id: string) {
		// setIdKanban(id);
		reset({id, type: "preview"});
		modalRef.current?.show();
	}

	async function printData(idOrAll: true | string) {
		loader?.show?.();
		if (typeof idOrAll === "string") {
			reset(prev => ({...prev, idKanbans: {[idOrAll]: true}}));
		} else {
			if (idKanbans.length <= 0) {
				loader?.hide?.();
				return alert("Silahkan pilih data terlebih dahulu");
			}
		}
		await genPdfRef.current?.generate();
		loader?.hide?.();
		reset(prev => ({...prev, type: undefined}));
		setTimeout(() => reset(prev => ({...prev, idKanbans: {}})), 2500);
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
			{loader.component}
			<GeneratePdf
				splitPagePer={4}
				orientation="l"
				ref={genPdfRef}
				width="w-[2200px]"
				tagId={`${route}-generated`}
				renderItem={({data}) => (
					<RenderPdfData className="w-1/2" data={data} route={route} />
				)}
				useQueries={() =>
					trpc.useQueries(t => idKanbans.map(id => t.kanban.detail(id)))
				}
			/>
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form context={{disabled: isPreview, hideButton: isPreview}}>
					<KanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>

			<TableFilter
				data={data}
				keyExtractor={item => item.id}
				form={hookForm}
				topComponent={
					route === "qc" ? (
						isSelect ? (
							<>
								<Button onClick={() => printData(true)}>Print</Button>
								<Button
									onClick={() =>
										reset(prev => ({...prev, type: undefined, idKanbans: {}}))
									}>
									Batal
								</Button>
							</>
						) : (
							<Button
								onClick={() => reset(prev => ({...prev, type: "select"}))}>
								Batch Print
							</Button>
						)
					) : null
				}
				header={[
					isSelect && (
						<SelectAllButton
							selector="id_kanban"
							form={formData}
							property="idKanbans"
							data={data?.rows}
							selected={idKanbans.length}
							total={data?.rows.length}
							onClick={prev => reset(prev)}
						/>
					),
					"Tanggal",
					"Nomor Kanban",
					"Keterangan",
					!isSelect && "Action",
				]}
				renderItem={item => {
					return (
						<RenderData
							{...item}
							control={control}
							key={item.item.id_kanban}
							printOne={id => printData(id)}>
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
	children,
	control,
}: // printOne,
PropsWithChildren<
	MMapValue<ScanList> &
		Cells & {
			control: Control<ScanListFormType>;
			printOne?: (idKanban: string) => void;
		}
>) {
	const {data} = trpc.kanban.detail.useQuery(item.id_kanban as string);

	const [modalType, idKanbans] = useWatch({
		control,
		name: ["type", "idKanbans"],
	});
	const {isSelect} = modalTypeParser(modalType);

	return (
		<>
			{isSelect && (
				<CellSelect
					noLabel
					control={control}
					key={`${idKanbans?.[item.id_kanban]}`}
					fieldName={`idKanbans.${item.id_kanban}`}
				/>
			)}
			<Cell>{dateUtils.date(data?.createdAt)}</Cell>
			<Cell>{data?.nomor_kanban}</Cell>
			<Cell>{data?.keterangan}</Cell>
			{!isSelect && (
				<Cell className="flex gap-2">
					{/* <Button icon="faPrint" onClick={() => printOne?.(item.id_kanban)} /> */}
					{children}
				</Cell>
			)}
		</>
	);
}

function RenderPdfData({
	data,
	route,
	className,
}: Route & {data?: null | KanbanGetRow; className?: string}) {
	const items = Object.entries(data?.items ?? {});
	const [, , , , /* formName */ cardName] = scanMapperByStatus(route);

	return (
		<div className={classNames("p-6", className, cuttingLineClassName)}>
			<div className={classNames(gap, padding, "flex flex-col bg-black")}>
				<div className={classNames("flex", gap)}>
					<div className="bg-white flex justify-center flex-1 p-2">
						<Text className="self-center text-4xl text-center">IMI</Text>
					</div>
					<div className="bg-white flex justify-center flex-1 p-2">
						<Text className="self-center text-xl text-center">{cardName}</Text>
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
					{moment(data?.createdAt).format("D MMMM YYYY")}
				</Wrapper>
				<Wrapper title="Nomor Lot IMI">{data?.dataScan?.lot_no_imi}</Wrapper>
				{items.map(item => (
					<RenderItem key={item[0]} item={item} />
				))}
			</div>
		</div>
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

	// const {data: parameterData} = trpc.basic.get.useQuery<any, TParameter[]>({
	// 	target: CRUD_ENABLED.PARAMETER,
	// 	where: JSON.stringify({
	// 		id: detailProcess?.parameter,
	// 	} as Partial<TParameter>),
	// });

	const selectedSppbIn = dataSppbIn?.[0];
	const selectedSppbInItem = selectedSppbIn?.items?.find(e => e.id === id_item);
	const selectedItem = dataPo?.[0]?.po_item.find(poItem => {
		return (
			poItem.id ===
			selectedSppbIn?.items?.find(sppbInItem => sppbInItem.id === item.id_item)
				?.id_item
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
			{/* <Wrapper title="Parameter">
				{parameterData?.map(e => e.name).join(", ")}
			</Wrapper> */}
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

const spacing = 1;
const gap = `gap-[${spacing}px]`;
const padding = `p-[${spacing}px]`;

function Wrapper(props: WrapperProps) {
	return (
		<Wrp
			{...props}
			noColon
			sizes={["w-1/4 font-semibold", "flex-1 font-semibold"]}
		/>
	);
}

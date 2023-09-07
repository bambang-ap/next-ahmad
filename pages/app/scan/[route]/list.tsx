import {useEffect, useRef} from "react";

import {useRouter} from "next/router";
import {KanbanFormType as KanbanFormTypee} from "pages/app/kanban";
import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import {Wrapper as Wrp, WrapperProps} from "@appComponent/Wrapper";
import {Route} from "@appTypes/app.type";
import {
	Button,
	Form,
	Modal,
	ModalRef,
	TableFilterV3,
	TableFilterV3Ref,
	VRenderItem,
} from "@components";
import {getLayout} from "@hoc";
import {useKanban, useLoader, useNewExportData} from "@hooks";
import {NewKanbanModalChild} from "@pageComponent/kanban_ModalChild/index-new";
import {RenderData} from "@pageComponent/scan/list/RenderData";
import {RenderPdfData} from "@pageComponent/scan/list/RenderPdfData";
import {TxtBold} from "@pageComponent/sppbOut_GenerateQR";
import {atomHeaderTitle} from "@recoil/atoms";
import type {ScanList} from "@trpc/routers/scan";
import {modalTypeParser, transformIds} from "@utils";
import {trpc} from "@utils/trpc";

ListScanData.getLayout = getLayout;
export const Text = TxtBold;
export type ScanListFormType = KanbanFormTypee;

export default function ListScanData() {
	useKanban();

	const loader = useLoader();
	const modalRef = useRef<ModalRef>(null);
	const tableRef = useRef<TableFilterV3Ref>(null);
	const setTitle = useSetRecoilState(atomHeaderTitle);

	const {isReady, ...router} = useRouter();
	const {route} = router.query as Route;

	const {control, watch, reset} = useForm<ScanListFormType>();

	const formData = watch();

	const {type: modalType} = formData;

	const {isPreview, isSelect, modalTitle} = modalTypeParser(modalType);

	const isQC = route === "qc";

	const idKanbans = transformIds(formData.idKanbans);
	const {exportResult} = useNewExportData(
		() => {
			return trpc.export.scan.useQuery(
				{route, idKanbans},
				{enabled: idKanbans.length > 0},
			);
		},
		exportedData => exportedData,
		[route],
		true,
	);

	function preview(id: string) {
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
			{loader.component}
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form context={{disabled: isPreview, hideButton: isPreview}}>
					<NewKanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>

			<TableFilterV3
				ref={tableRef}
				property="idKanbans"
				selector="id_kanban"
				control={control}
				reset={reset}
				useQuery={form =>
					trpc.scan.list.useQuery({
						...form,
						target: route,
					})
				}
				genPdfOptions={{
					splitPagePer: 4,
					orientation: "l",
					width: "w-[2200px]",
					tagId: `${route}-generated`,
					renderItem: ({data}) => (
						<RenderPdfData className="w-1/2" data={data!} route={route} />
					),
					useQueries: () =>
						trpc.useQueries(t =>
							idKanbans.map(id =>
								t.kanban.detail(id, {enabled: isQC && idKanbans.length > 0}),
							),
						),
				}}
				keyExtractor={item => item.id}
				enabledPdf={isQC}
				enabledExport
				exportResult={exportResult}
				onCancel={() =>
					reset(prev => ({...prev, type: undefined, idKanbans: {}}))
				}
				header={[
					"Tanggal",
					"Nomor Kanban",
					"Keterangan",
					!isSelect && "Action",
				]}
				renderItem={(item: VRenderItem<ScanList>) => {
					return (
						<RenderData
							{...item}
							control={control}
							key={item.item.id_kanban}
							route={route}
							printOne={id => tableRef.current?.printData?.(id)}>
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

export function Wrapper(props: WrapperProps) {
	return (
		<Wrp
			{...props}
			noColon
			sizes={["w-1/4 font-semibold", "flex-1 font-semibold"]}
		/>
	);
}

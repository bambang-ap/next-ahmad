import {useEffect, useRef} from "react";

import {useRouter} from "next/router";
import {KanbanFormType as KanbanFormTypee} from "pages/app/kanban";
import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import {
	GeneratePdf,
	GenPdfRef,
	SelectAllButton,
} from "@appComponent/GeneratePdf";
import {Wrapper as Wrp, WrapperProps} from "@appComponent/Wrapper";
import {Button, Form, Modal, ModalRef, TableFilter} from "@components";
import {getLayout} from "@hoc";
import {useKanban, useLoader, useNewExportData, useTableFilter} from "@hooks";
import {KanbanModalChild} from "@pageComponent/kanban_ModalChild";
import {TxtBold} from "@pageComponent/sppbOut_GenerateQR";
import {atomHeaderTitle} from "@recoil/atoms";
import {modalTypeParser} from "@utils";
import {trpc} from "@utils/trpc";

import {Route} from ".";
import {RenderData} from "../../../../src/components/pages/scan/list/RenderData";
import {RenderPdfData} from "../../../../src/components/pages/scan/list/RenderPdfData";

ListScanData.getLayout = getLayout;
export const Text = TxtBold;
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

	const isQC = route === "qc",
		isProd = route === "produksi";
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

	const {exportResult} = useNewExportData(
		() => {
			return trpc.export.scan.useQuery(
				{route, idKanbans},
				{enabled: isProd && idKanbans.length > 0},
			);
		},
		item => item,
		["produksi"],
	);

	async function exportList() {
		exportResult();
		reset(prev => ({...prev, type: undefined}));
		setTimeout(() => reset(prev => ({...prev, idKanbans: {}})), 2500);
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
				// eslint-disable-next-line @typescript-eslint/no-shadow
				renderItem={({data}) => (
					<RenderPdfData className="w-1/2" data={data} route={route} />
				)}
				useQueries={() =>
					trpc.useQueries(t =>
						idKanbans.map(id =>
							t.kanban.detail(id, {enabled: isQC && idKanbans.length > 0}),
						),
					)
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
					isQC || isProd ? (
						isSelect ? (
							<>
								{isQC && <Button onClick={() => printData(true)}>Print</Button>}
								{isProd && <Button onClick={exportList}>Export</Button>}
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
								Select
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

export function Wrapper(props: WrapperProps) {
	return (
		<Wrp
			{...props}
			noColon
			sizes={["w-1/4 font-semibold", "flex-1 font-semibold"]}
		/>
	);
}

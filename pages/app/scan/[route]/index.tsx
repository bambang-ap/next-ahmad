import {useEffect, useRef} from "react";

import {useRouter} from "next/router";
import {Control, useForm} from "react-hook-form";
import {useRecoilState} from "recoil";

import {TDataScan} from "@appTypes/app.type";
import {TScan, TScanItem, TScanTarget, ZId} from "@appTypes/app.zod";
import {ScanIds} from "@appTypes/props.type";
import {Scanner} from "@componentBlocks";
import {Button, Form, Input, ModalRef} from "@components";
import {defaultErrorMutation} from "@constants";
import {getLayout} from "@hoc";
import {ScanDetailKanban} from "@pageComponent/scan_GenerateQR";
import Scrollbar from "@prevComp/Scrollbar";
import {selectorScanIds} from "@recoil/selectors";
import {scanMapperByStatus} from "@utils";
import {StorageScan} from "@utils/storage";
import {trpc} from "@utils/trpc";

Scan.getLayout = getLayout;

export type Route = {route: TScanTarget};

export type FormTypeScan = Pick<
	TScan,
	keyof TScanItem | "lot_no_imi" | "id" | "notes"
>;
export type FormType = {
	form: ZId[];
};

export default function Scan() {
	const {isReady, asPath, push, ...router} = useRouter();
	const {route} = router.query as Route;

	const [ids, setIds] = useRecoilState(selectorScanIds.get(route)!);

	function addNew() {
		setIds(prev => [...prev, {key: uuid(), id: ""}]);
	}

	function navigateListData() {
		push(`${asPath}/list`);
	}

	// useEffect(() => {
	// 	return () => setIds([{key: uuid(), id: ""}]);
	// }, [route]);

	useEffect(() => {
		if (!!route) {
			const prev = StorageScan.get(route)!.get()!;
			if (prev.length > 0) setIds(prev?.map(e => ({key: uuid(), id: e})));
			else setIds([{id: "", key: uuid()}]);
		}
	}, [route]);

	if (!isReady) return null;

	return (
		<div className="flex flex-col gap-2 h-full">
			<div className="flex gap-2">
				<Button className="flex-1" icon="faPlus" onClick={addNew}>
					Tambah
				</Button>
				<Button className="flex-1" icon="faList" onClick={navigateListData}>
					List Data
				</Button>
			</div>

			<Scrollbar>
				{ids.map(uId => (
					<RenderScanPage key={uId.key} data={uId} />
				))}
			</Scrollbar>
		</div>
	);
}

function RenderScanPage({data: {id: uId, key}}: {data: ScanIds}) {
	const qrcodeRef = useRef<ModalRef>(null);
	const router = useRouter();

	const {route} = router.query as Route;
	const [ids, setIds] = useRecoilState(selectorScanIds.get(route)!);
	const {control, watch, handleSubmit, setValue, reset} = useForm<FormTypeScan>(
		{defaultValues: {id: uId}},
	);

	const id = watch("id");
	const currentKey = `status_${route}` as const;
	const [, , submitText] = scanMapperByStatus(route);

	const {data, refetch} = trpc.scan.get.useQuery(
		{id, target: route},
		{enabled: !!id, ...defaultErrorMutation},
	);

	const {mutate} = trpc.scan.update.useMutation({
		...defaultErrorMutation,
		onSuccess: () => refetch(),
	});

	const status = data?.[currentKey];

	const submit = handleSubmit(values => {
		function mutateScan() {
			refetch();
			mutate({...values, id, target: route});
		}
		if (route === "qc") {
			if (confirm("Apakah Anda yakin data tersebut sudah benar?"))
				return mutateScan();

			return;
		}

		mutateScan();
	});

	function onRead(result: string) {
		setValue("id", result);
	}

	function removeUid() {
		StorageScan.get(route!)?.set(prev => {
			const prevSet = new Set(prev);
			prevSet.delete(id);
			return [...prevSet];
		});
		setIds(prev => {
			const index = ids.findIndex(_id => _id.key === key);
			if (status) return prev.replace(index, {...prev[index]!, id: ""});
			return prev.remove(index);
		});
	}

	useEffect(() => {
		if (data) {
			StorageScan.get(route!)?.set(prev => {
				const prevSet = new Set(prev);
				prevSet.add(id);
				return [...prevSet];
			});
			reset(prev => {
				const {
					item_finish_good,
					// item_out_barang,
					item_produksi,
					item_qc,
					lot_no_imi,
					item_qc_reject,
					notes,
				} = data;
				return {
					...prev,
					notes,
					item_qc_reject,
					lot_no_imi,
					item_finish_good,
					// item_out_barang,
					item_produksi,
					item_qc,
				};
			});
		}
	}, [data]);

	return (
		<Form
			onSubmit={submit}
			className="flex flex-col gap-2 p-2 border"
			context={{disableSubmit: status, disabled: status}}>
			<Scanner ref={qrcodeRef} title={`Scan ${route}`} onRead={onRead} />
			<div className="flex gap-2 items-center">
				<Input
					disabled={false}
					className="flex-1"
					control={control}
					fieldName="id"
				/>
				{/* <Button onClick={() => qrcodeRef.current?.show()}>Scan Camera</Button> */}
				<Button
					icon={status ? "faEyeSlash" : "faCircleXmark"}
					onClick={removeUid}
				/>
				{id && !!data && (
					<Button disabled={status} type="submit">
						{submitText}
					</Button>
				)}
			</div>
			{data && <RenderDataKanban {...data} control={control} route={route} />}
		</Form>
	);
}

function RenderDataKanban(
	kanban: TDataScan & Route & {control: Control<FormTypeScan>},
) {
	const {dataKanban, route, control, ...rest} = kanban;

	const [kanbans] = dataKanban ?? [];

	const currentKey = `status_${route}` as const;

	const currentStatus = rest[currentKey];

	if (!kanbans) return null;

	return (
		<>
			{currentStatus}
			<ScanDetailKanban
				route={route}
				control={control}
				status={currentStatus}
				{...kanbans}
			/>
		</>
	);
}

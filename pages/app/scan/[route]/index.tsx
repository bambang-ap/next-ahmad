import {FormEventHandler, Fragment, useEffect, useState} from "react";

import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {KanbanFormType} from "pages/app/kanban";
import {useForm} from "react-hook-form";
import {useRecoilState, useSetRecoilState} from "recoil";

import {
	KanbanGetRow,
	RouterInput,
	TRoute,
	TScan,
	TScanItem,
	TScanTarget,
	ZId,
} from "@appTypes/app.type";
import {getRejectSelection} from "@appTypes/app.zod";
import {ScanIds} from "@appTypes/props.type";
import {
	BorderTd,
	Button,
	Form,
	Input,
	RootTable,
	Select,
	Text,
} from "@components";
import {getLayout} from "@hoc";
import {useLoader} from "@hooks";
import {RenderMesin} from "@pageComponent/kanban_ModalChild/RenderMesin";
import Scrollbar from "@prevComp/Scrollbar";
import {selectorScanIds} from "@recoil/selectors";
import {
	classNames,
	dateUtils,
	qtyMap,
	scanMapperByStatus,
	scanRouterParser,
	typingCallback,
} from "@utils";
import {StorageScan} from "@utils/storage";
import {trpc} from "@utils/trpc";

Scan.getLayout = getLayout;

const {TBody, THead, Tr} = RootTable;

const Td = BorderTd;

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
		setIds(prev => [{key: uuid(), id: ""}, ...prev]);
	}

	function navigateListData() {
		push(`${asPath}/list`);
	}

	useEffect(() => {
		if (!!route) {
			const prev = StorageScan.get(route)!.get()!;
			if (prev.length > 0) setIds(prev?.map(e => ({key: uuid(), id: e})));
			else setIds([{id: "", key: uuid()}]);
		}
	}, [route]);

	if (!isReady) return null;

	return (
		<div key={route} className="flex flex-col gap-2 h-full">
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
					<RenderNewScanPage key={uId.key} keys={uId} route={route} />
				))}
			</Scrollbar>
		</div>
	);
}

type ScanFormType = RouterInput["scan"]["updateV3"];

function RenderNewScanPage(props: {keys: ScanIds} & TRoute) {
	const {route, keys} = props;

	const {data: session} = useSession();
	const {mutateOpts, ...loader} = useLoader();
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<ScanFormType>({defaultValues: {reject: false}});

	const dataForm = watch();
	const setIds = useSetRecoilState(selectorScanIds.get(route)!);
	prettyConsole(dataForm);
	const {data, refetch, isSuccess, isFetching} = trpc.scan.getV3.useQuery(
		{id: dataForm.id_kanban!, route},
		{enabled: !!dataForm.id_kanban},
	);
	const {mutate: editNotes} = trpc.scan.editNotes.useMutation();
	const {mutateAsync: mutate} = trpc.scan.updateV3.useMutation({
		...mutateOpts,
		async onSuccess() {
			refetch();
			loader.hide?.();
		},
	});

	const {OrmKanban, OrmScanNewItems} = data ?? {};
	const {OrmCustomerSPPBIn, dataCreatedBy, OrmKanbanItems} = OrmKanban ?? {};
	const {OrmCustomerPO} = OrmCustomerSPPBIn ?? {};
	const {OrmCustomer} = OrmCustomerPO ?? {};

	const {notes = "", id_kanban} = dataForm;
	const {isProduksi, isQC, width, colSpan} = scanRouterParser(route);

	const [, , submitText] = scanMapperByStatus(route);
	const [jumlahPrev, jumlahNext] = scanMapperByStatus(route);

	const status = route === data?.status;
	const showReject = isQC && dataForm.reject;

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();

		handleSubmit(values => {
			if (route === "qc") {
				if (confirm("Apakah Anda yakin data tersebut sudah benar?"))
					return mutate(values);

				return;
			}

			return mutate(values);
		})();
	};

	function removeUid() {
		StorageScan.get(route!)?.set(prev => {
			const prevSet = new Set(prev);
			prevSet.delete(id_kanban);
			return [...prevSet];
		});
		setIds(prev => {
			const index = prev.findIndex(ids => ids.key === keys.key);
			return prev.remove(index);
		});
	}

	function toggleReject() {
		// @ts-ignore
		reset(prev => {
			prev.reject = !prev.reject;
			const rejectItems = prev.reject ? prev.rejectItems : undefined;
			return {...prev, rejectItems};
		});
	}

	useEffect(() => {
		if (data) {
			StorageScan.get(route!)?.set(prev => {
				const prevSet = new Set(prev);
				prevSet.add(id_kanban);
				return [...prevSet].filter(Boolean);
			});
		}
	}, [data, id_kanban]);

	useEffect(() => {
		if (notes?.length > 0) {
			typingCallback(() => {
				editNotes({notes, id: id_kanban, status: route});
			}, 1000);
		}
	}, [id_kanban, notes, route]);

	return (
		<>
			{loader.component}
			<Form
				onSubmit={submit}
				context={{disableSubmit: status, disabled: status}}>
				<RootTable>
					<THead>
						<Tr>
							<Td colSpan={colSpan} className="flex gap-2 items-center">
								<Input
									hidden
									className="flex-1"
									control={control}
									defaultValue={data?.id}
									fieldName="id"
								/>
								<Input
									hidden
									className="flex-1"
									control={control}
									defaultValue={OrmCustomer?.id}
									fieldName="id_customer"
								/>
								<Input
									hidden
									className="flex-1"
									control={control}
									defaultValue={route}
									fieldName="status"
								/>
								<Input
									forceEditable
									className="flex-1"
									control={control}
									fieldName="id_kanban"
									defaultValue={keys.id}
								/>
								<Button
									icon={status ? "faTrash" : "faCircleXmark"}
									onClick={removeUid}
								/>
								{isQC && (
									<Button onClick={toggleReject}>
										{showReject ? "Batal Reject" : "Reject"}
									</Button>
								)}
								{!isFetching && !!data && (
									<Button type="submit" className="h-10" disabled={status}>
										{submitText}
									</Button>
								)}
							</Td>
						</Tr>
					</THead>
					<TBody className={classNames({"!hidden": !isSuccess || isFetching})}>
						<Tr>
							<Td width={width} className="flex-col">
								<div>Tanggal Kanban :</div>
								<div>{dateUtils.full(data?.OrmKanban?.createdAt)}</div>
							</Td>
							<Td width={width} className="flex-col">
								<div>User :</div>
								<div>{session?.user?.name}</div>
							</Td>
							<Td width={width} className="flex-col">
								<div>Created by :</div>
								<div>{dataCreatedBy?.name}</div>
							</Td>
							<Td width={width} className="flex-col">
								<div>Customer :</div>
								<div>{OrmCustomer?.name}</div>
							</Td>
							{showReject && (
								<Td className="flex-col" rowSpan={2}>
									Silahkan sertakan alasan jika Anda ingin menolaknya.
									<Select
										className="flex-1"
										fieldName="reason"
										label="Alasan"
										control={control}
										data={getRejectSelection()}
									/>
								</Td>
							)}
						</Tr>
						<Tr>
							<Td>NO PO : {OrmCustomerPO?.nomor_po}</Td>
							<Td>NO Surat : {OrmCustomerSPPBIn?.nomor_surat}</Td>
							<Td>
								<Input
									className="flex-1"
									control={control}
									fieldName="lot_no_imi"
									defaultValue={data?.lot_no_imi}
								/>
							</Td>
							<Td>
								<Input
									forceEditable
									className="flex-1"
									control={control}
									fieldName="notes"
									defaultValue={data?.notes}
								/>
							</Td>
						</Tr>
						<Tr>
							<Td colSpan={colSpan} center>
								Items
							</Td>
						</Tr>
						<Tr>
							<Td>Kode Item</Td>
							<Td>Nama Item</Td>
							<Td>{jumlahPrev}</Td>
							<Td>{jumlahNext}</Td>
							{showReject && <Td>Jumlah Reject</Td>}
						</Tr>
						{OrmKanbanItems?.map(restItem => {
							const {id, OrmMasterItem, OrmPOItemSppbIn, ...item} = restItem;
							const poItem = OrmPOItemSppbIn.OrmCustomerPOItem;

							const curItem = OrmScanNewItems?.find(
								e => e.id_kanban_item === id,
							);
							const rejectedItem = curItem?.OrmScanNewItemRejects.find(
								e => e.id_item === curItem.id,
							);
							const prevItem = isProduksi ? item : curItem;

							return (
								<Fragment key={id}>
									<Tr>
										<Input
											hidden
											control={control}
											fieldName={`items.${id}.id_kanban_item`}
											defaultValue={id}
										/>
										<Td>{OrmMasterItem.kode_item}</Td>
										<Td>{OrmMasterItem.name}</Td>
										<Td>
											{qtyMap(({unitKey, qtyKey, num}) => {
												if (!poItem[unitKey]) return null;
												return (
													<Input
														className="flex-1"
														disabled
														control={control}
														label={`Qty ${num}`}
														defaultValue={prevItem?.[qtyKey]!.toString()}
														rightAcc={<Text>{poItem[unitKey]}</Text>}
														fieldName={`tempItems.${id}.${qtyKey}`}
													/>
												);
											})}
										</Td>
										<Td>
											{qtyMap(({unitKey, qtyKey, num}) => {
												if (!poItem[unitKey]) return null;

												const max = prevItem?.[qtyKey]!;

												return (
													<Input
														className="flex-1"
														label={`Qty ${num}`}
														control={control}
														type="decimal"
														rightAcc={<Text>{poItem[unitKey]}</Text>}
														rules={{
															max: {value: max, message: `Max is ${max}`},
														}}
														defaultValue={curItem?.[qtyKey]?.toString()}
														fieldName={`items.${id}.${qtyKey}`}
													/>
												);
											})}
										</Td>
										{showReject && (
											<Td>
												{qtyMap(({unitKey, qtyKey, num}) => {
													if (!poItem[unitKey]) return null;

													const max =
														prevItem?.[qtyKey]! -
														parseFloat(
															dataForm?.items?.[id]?.[qtyKey]!.toString() ??
																"0",
														);

													return (
														<Input
															className="flex-1"
															label={`Qty ${num}`}
															control={control}
															type="decimal"
															shouldUnregister
															rightAcc={<Text>{poItem[unitKey]}</Text>}
															fieldName={`rejectItems.${id}.${qtyKey}`}
															defaultValue={rejectedItem?.[qtyKey]!.toString()}
															rules={{
																max: {value: max, message: `Max is ${max}`},
															}}
														/>
													);
												})}
											</Td>
										)}
									</Tr>
									<Tr>
										<Td colSpan={colSpan}>
											<RenderListMesin
												master_item_id={OrmMasterItem.id}
												id_item={OrmPOItemSppbIn.id}
												list_mesin={OrmKanban?.list_mesin!}
											/>
										</Td>
									</Tr>
								</Fragment>
							);
						})}
					</TBody>
				</RootTable>
			</Form>
		</>
	);
}

function RenderListMesin({
	master_item_id,
	id_item,
	list_mesin,
}: {
	id_item: string;
	master_item_id?: string;
	list_mesin: KanbanGetRow["list_mesin"];
}) {
	const [keyMesin, setKeyMesin] = useState(uuid());
	const {control, reset} = useForm<KanbanFormType>({
		defaultValues: {list_mesin},
	});

	useEffect(() => {
		setTimeout(() => setKeyMesin(uuid()), 500);
	}, []);

	if (!master_item_id) return null;

	return (
		<div className="bg-white flex-1">
			<RenderMesin
				key={keyMesin}
				reset={reset}
				control={control}
				masterId={master_item_id}
				idItem={id_item}
			/>
		</div>
	);
}

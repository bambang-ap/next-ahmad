import {FormEventHandler, Fragment, useEffect, useState} from "react";

import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {KanbanFormType} from "pages/app/kanban";
import {useForm} from "react-hook-form";
import {useRecoilState} from "recoil";

import {
	KanbanGetRow,
	RouterInput,
	TRoute,
	TScan,
	TScanItem,
	TScanTarget,
	ZId,
} from "@appTypes/app.type";
import {ScanIds} from "@appTypes/props.type";
import {BorderTd, Button, Form, Input, RootTable, Text} from "@components";
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
	const {control, watch, handleSubmit, clearErrors} = useForm<ScanFormType>();
	const {data, refetch, isSuccess, isFetching} = trpc.scan.getV3.useQuery(
		{id: keys.id, route},
		{enabled: !!keys.id},
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

	const [notes = "", id_kanban] = watch(["notes", "id"]);
	const [, , submitText] = scanMapperByStatus(route);
	const {isProduksi} = scanRouterParser(route);
	const [jumlahPrev, jumlahNext] = scanMapperByStatus(route);

	const status = route === data?.status;

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
							<Td colSpan={4} className="flex gap-2 items-center">
								<Input
									hidden
									className="flex-1"
									control={control}
									defaultValue={data?.id ?? keys.id}
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
									defaultValue={id_kanban}
								/>
								<Button
									type="submit"
									className="h-10"
									disabled={status || isFetching}>
									{submitText}
								</Button>
							</Td>
						</Tr>
					</THead>
					<TBody className={classNames({"!hidden": !isSuccess || isFetching})}>
						<Tr>
							<Td width="25%" className="justify-between">
								<div>Tanggal Kanban :</div>
								<div>{dateUtils.full(data?.OrmKanban?.createdAt)}</div>
							</Td>
							<Td width="25%" className="justify-between">
								<div>User :</div>
								<div>{session?.user?.name}</div>
							</Td>
							<Td width="25%" className="justify-between">
								<div>Created by :</div>
								<div>{dataCreatedBy?.name}</div>
							</Td>
							<Td width="25%" className="justify-between">
								<div>Customer :</div>
								<div>{OrmCustomer?.name}</div>
							</Td>
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
							<Td colSpan={4} center>
								Items
							</Td>
						</Tr>
						<Tr>
							<Td>Kode Item</Td>
							<Td>Nama Item</Td>
							<Td>{jumlahPrev}</Td>
							<Td>{jumlahNext}</Td>
						</Tr>
						{OrmKanbanItems?.map(restItem => {
							const {id, OrmMasterItem, OrmPOItemSppbIn, ...item} = restItem;
							const poItem = OrmPOItemSppbIn.OrmCustomerPOItem;

							const curItem = OrmScanNewItems?.find(
								e => e.id_kanban_item === id,
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
									</Tr>
									<Tr>
										<Td colSpan={4}>
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

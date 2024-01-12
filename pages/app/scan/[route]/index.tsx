import {FormEventHandler, Fragment, useEffect, useState} from 'react';

import {KanbanFormType} from 'pages/app/kanban';
import {FieldPath, useForm} from 'react-hook-form';
import {useRecoilState, useSetRecoilState} from 'recoil';

import {
	KanbanGetRow,
	RouterInput,
	TRoute,
	TScan,
	TScanItem,
	TScanNewItem,
	TScanTarget,
	UnitQty,
	ZId,
} from '@appTypes/app.type';
import {getRejectSelection} from '@appTypes/app.zod';
import {ScanIds} from '@appTypes/props.type';
import {
	BorderTd,
	Button,
	Form,
	Input,
	InputDummy,
	RootTable,
	Select,
	Text,
} from '@components';
import {PATHS} from '@enum';
import {getLayout} from '@hoc';
import {useLoader, useRouter, useSession} from '@hooks';
import {RenderMesin} from '@pageComponent/kanban_ModalChild/RenderMesin';
import Scrollbar from '@prevComp/Scrollbar';
import {selectorScanIds} from '@recoil/selectors';
import {
	classNames,
	dateUtils,
	isAdminRole,
	qtyMap,
	scanMapperByStatus,
	scanRouterParser,
	typingCallback,
} from '@utils';
import {StorageScan} from '@utils/storage';
import {trpc} from '@utils/trpc';

Scan.getLayout = getLayout;

const {TBody, THead, Tr} = RootTable;

const Td = BorderTd;

export type Route = {route: TScanTarget};
export type FormTypeScan = Pick<
	TScan,
	keyof TScanItem | 'lot_no_imi' | 'id' | 'notes'
>;
export type FormType = {
	form: ZId[];
};

export default function Scan() {
	const {isReady, asPath, push, ...router} = useRouter();
	const {route} = router.query as Route;

	const [ids, setIds] = useRecoilState(selectorScanIds.get(route)!);

	function addNew() {
		setIds(prev => [{key: uuid(), id: ''}, ...prev]);
	}

	function navigateListData() {
		push(`${asPath}/list` as PATHS);
	}

	useEffect(() => {
		if (!!route) {
			const prev = StorageScan.get(route)!.get()!;
			if (prev.length > 0) setIds(prev?.map(e => ({key: uuid(), id: e})));
			else setIds([{id: '', key: uuid()}]);
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
				<div className="flex flex-col gap-4">
					{ids.map(uId => (
						<RenderNewScanPage
							key={`${route}.${uId.key}`}
							keys={uId}
							route={route}
						/>
					))}
				</div>
			</Scrollbar>
		</div>
	);
}

type ScanFormType = RouterInput['scan']['updateV3'];

function RenderNewScanPage(props: {keys: ScanIds} & TRoute) {
	const {route, keys} = props;

	const {data: session} = useSession();
	const {mutateOpts, ...loader} = useLoader();
	const {control, reset, watch, handleSubmit, clearErrors, setValue} =
		useForm<ScanFormType>({defaultValues: {reject: false}});

	const dataForm = watch();

	const setIds = useSetRecoilState(selectorScanIds.get(route)!);

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

	const {dKanban: OrmKanban, dScanItems} = data ?? {};
	const {
		id: foundedKanbanId,
		dSJIn: OrmCustomerSPPBIn,
		dataCreatedBy,
		dKnbItems: OrmKanbanItems,
	} = OrmKanban ?? {};
	const {dPo: OrmCustomerPO} = OrmCustomerSPPBIn ?? {};
	const {dCust: OrmCustomer} = OrmCustomerPO ?? {};

	const isRejected = data?.is_rejected;

	const {notes = '', id_kanban = ''} = dataForm;
	const {isProduksi, isQC, width, isFG, colSpan, rejectTitle} =
		scanRouterParser(route, isRejected);

	const isAdmin = isAdminRole(session?.user?.role);
	const status = route === data?.status;
	const forceSubmit = status && isAdmin;

	const aaa = forceSubmit ? false : status;

	const [jumlahPrev, jumlahNext, submitText] = scanMapperByStatus(
		route,
		status,
		isAdmin,
	);

	const showReject = !isProduksi && (dataForm.reject || isRejected);
	const isHidden = !OrmKanban?.id || !isSuccess || isFetching;
	const isFetchingData = !isHidden && (forceSubmit || (!isFetching && !!data));

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();

		handleSubmit(values => {
			if (forceSubmit) {
				if (
					!confirm('Data sudah disubmit, apakah anda yakin akan mengubah data?')
				)
					return;
			}
			if (route === 'qc') {
				if (confirm('Apakah Anda yakin data tersebut sudah benar?'))
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
		if (!!foundedKanbanId) {
			StorageScan.get(route!)?.set(prev => {
				const prevSet = new Set(prev);
				prevSet.add(foundedKanbanId);
				return [...prevSet].filter(Boolean);
			});
		}
	}, [foundedKanbanId]);

	useEffect(() => {
		if (notes!?.length > 0) {
			typingCallback(() => {
				editNotes({notes, id: id_kanban, status: route});
			}, 1000);
		}
	}, [id_kanban, notes, route]);

	useEffect(() => {
		if (keys.id.length > 0) {
			reset(prev => ({...prev, id_kanban: keys.id}));
		}
	}, [keys.id]);

	return (
		<>
			{loader.component}
			<Form onSubmit={submit} context={{disableSubmit: aaa, disabled: aaa}}>
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
									hidden
									className="flex-1"
									control={control}
									defaultValue={OrmCustomerPO?.id}
									fieldName="id_po"
								/>
								<Input
									control={control}
									label="ID Kanban"
									className="flex-1"
									fieldName="id_kanban"
									defaultValue={keys.id}
									isLoading={isFetching}
									errorMessage="Data tidak ditemukan"
									rightAcc={
										<div className="whitespace-nowrap">
											{OrmKanban?.keterangan}
										</div>
									}
									isError={isHidden && id_kanban.length > 0}
								/>
								<Button icon="faCircleXmark" onClick={removeUid} />
								{isQC && !isRejected && !status && foundedKanbanId && (
									<Button onClick={toggleReject}>
										{showReject ? 'Batal Reject' : 'Reject'}
									</Button>
								)}
								{isFetchingData && (
									<Button type="submit" className="h-10" disabled={aaa}>
										{submitText}
									</Button>
								)}
							</Td>
						</Tr>
					</THead>
					<TBody
						key={`${route}.${id_kanban}`}
						className={classNames({'!hidden': isHidden})}>
						<Tr>
							<Td width={width} className="flex-col">
								<div>Tanggal Kanban :</div>
								<div>{dateUtils.full(data?.dKanban?.createdAt)}</div>
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
									{rejectTitle}
									<Select
										disabled={isFG}
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
							<Td className="gap-2">
								<InputDummy
									disabled
									label="Nomor Lot"
									className="flex-1"
									byPassValue={data?.dKanban?.dKnbItems?.[0]?.dInItem?.lot_no}
								/>
								<Input
									disabled={!isProduksi}
									className="flex-1"
									control={control}
									fieldName="lot_no_imi"
									label="No Lot IMI"
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
							const {
								id,
								dItem: OrmMasterItem,
								dInItem: OrmPOItemSppbIn,
								...item
							} = restItem;
							const poItem = OrmPOItemSppbIn.dPoItem;

							const curItem = dScanItems?.find(e => e.id_kanban_item === id);
							const rejectItem = curItem?.dRejItems.find(
								e => e.id_item === curItem.id,
							);

							const prevItem = (isProduksi ? item : curItem) as UnitQty &
								Pick<TScanNewItem, 'item_from_kanban'>;

							const prevItemKanban = isProduksi
								? curItem?.item_from_kanban ?? prevItem
								: prevItem;

							if (!!rejectItem?.reason && dataForm.reject && !dataForm.reason) {
								setValue('reason', rejectItem?.reason);
							}

							return (
								<Fragment key={id}>
									<Tr>
										<Input
											hidden
											control={control}
											fieldName={`items.${id}.id_kanban_item`}
											defaultValue={id}
										/>
										{!!rejectItem && (
											<Input
												hidden
												control={control}
												fieldName="id_qc"
												defaultValue={rejectItem?.dScanItem.dScan.id}
												shouldUnregister
											/>
										)}
										<Td>{OrmMasterItem.kode_item}</Td>
										<Td>{OrmMasterItem.name}</Td>

										<Td className="bg-green-500 gap-2">
											{qtyMap(({unitKey, qtyKey, num}) => {
												if (!poItem[unitKey]) return null;

												return (
													<Input
														className="flex-1"
														disabled
														control={control}
														label={`Qty ${num}`}
														defaultValue={prevItemKanban?.[qtyKey]!.toString()}
														rightAcc={<Text>{poItem[unitKey]}</Text>}
														fieldName={`prevItems.${id}.${qtyKey}`}
													/>
												);
											})}
										</Td>
										<Td className="gap-2">
											{qtyMap(({unitKey, qtyKey, num}) => {
												if (!poItem[unitKey]) return null;

												const max = prevItem?.[qtyKey]!;
												const defaultValue = curItem?.[qtyKey]?.toString();

												return (
													<>
														<Input
															hidden
															control={control}
															fieldName={`items.${id}.item_from_kanban.${qtyKey}`}
															defaultValue={(
																prevItem?.item_from_kanban?.[qtyKey] ??
																item[qtyKey]
															)?.toString()}
														/>
														<Input
															className="flex-1"
															label={`Qty ${num}`}
															control={control}
															type="decimal"
															rightAcc={<Text>{poItem[unitKey]}</Text>}
															rules={{
																max: {value: max, message: `Max is ${max}`},
															}}
															defaultValue={
																isProduksi
																	? defaultValue ?? item[qtyKey]?.toString()!
																	: defaultValue
															}
															fieldName={`items.${id}.${qtyKey}`}
														/>
													</>
												);
											})}
										</Td>
										{showReject && (
											<Td className="gap-2">
												{qtyMap(({unitKey, qtyKey, num}) => {
													if (!poItem[unitKey]) return null;

													const max =
														prevItem?.[qtyKey]! -
														parseFloat(
															dataForm?.items?.[id]?.[qtyKey]!.toString() ??
																'0',
														);

													// @ts-ignore
													const fieldName: FieldPath<ScanFormType> = isFG
														? `temp.${id}.${qtyKey}`
														: `rejectItems.${id}.${qtyKey}`;

													return (
														<>
															<Input
																className="flex-1"
																label={`Qty ${num}`}
																control={control}
																type="decimal"
																shouldUnregister
																fieldName={fieldName}
																disabled={isFG}
																rightAcc={<Text>{poItem[unitKey]}</Text>}
																defaultValue={rejectItem?.[qtyKey]!.toString()}
																rules={
																	isFG
																		? {}
																		: {
																				max: {
																					value: max,
																					message: `Max is ${max}`,
																				},
																		  }
																}
															/>
														</>
													);
												})}
											</Td>
										)}
									</Tr>
									<Tr>
										<Td colSpan={colSpan}>
											<RenderListMesin
												disabled
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
	disabled,
}: {
	disabled: boolean;
	id_item: string;
	master_item_id?: string;
	list_mesin: KanbanGetRow['list_mesin'];
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
				disabled={disabled}
				key={keyMesin}
				reset={reset}
				control={control}
				masterId={master_item_id}
				idItem={id_item}
			/>
		</div>
	);
}

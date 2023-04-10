import {useRef} from 'react';

import {Control, useForm, UseFormReset, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TCustomer,
	TCustomerSPPBOut,
	TKendaraan,
} from '@appTypes/app.type';
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	TableFilter,
	Text,
} from '@components';
import {defaultErrorMutation} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {useTableFilter} from '@hooks';
import {RenderListMesin} from '@pageComponent/scan_GenerateQR';
import {modalTypeParser, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

SPPBOUT.getLayout = getLayout;

type FormValue = {type: ModalTypePreview} & TCustomerSPPBOut;

export default function SPPBOUT() {
	const {dataKendaraan, dataCustomer} = useSppbOut();

	const modalRef = useRef<ModalRef>(null);

	const {formValue, hookForm} = useTableFilter();
	const {control, watch, reset, handleSubmit} = useForm<FormValue>();
	const {mutate} = trpc.sppb.out.upsert.useMutation();
	const {data, refetch} = trpc.sppb.out.get.useQuery(formValue);

	const [modalType] = watch(['type']);
	const {modalTitle, isPreview} = modalTypeParser(modalType);

	const submit = handleSubmit(values => {
		// return console.log(values);
		mutate(values, {
			...defaultErrorMutation,
			onSuccess() {
				refetch();
				modalRef.current?.hide();
			},
		});
	});

	function showModal({type, ...rest}: Partial<FormValue>) {
		reset({...rest, type});
		modalRef.current?.show();
	}

	return (
		<>
			<TableFilter
				form={hookForm}
				data={data?.rows}
				pageCount={data?.totalPage}
				header={['Nomor Surat', 'Kendaraan', 'Customer', 'Action']}
				topComponent={
					<Button
						onClick={() =>
							showModal({
								type: 'add',
								po: [{id_po: '', sppb_in: [{id_sppb_in: '', items: {}}]}],
							})
						}>
						Add
					</Button>
				}
				renderItem={({Cell, item}) => {
					const {id, id_kendaraan, id_customer} = item;
					const kendaraan = dataKendaraan.find(e => e.id === id_kendaraan);
					const customer = dataCustomer.find(e => e.id === id_customer);
					return (
						<>
							<Cell>{item.invoice_no}</Cell>
							<Cell>{kendaraan?.name}</Cell>
							<Cell>{customer?.name}</Cell>
							<Cell>
								<Button onClick={() => showModal({...item, type: 'preview'})}>
									Preview
								</Button>
								<Button onClick={() => showModal({...item, type: 'edit'})}>
									Edit
								</Button>
								<Button onClick={() => showModal({id, type: 'delete'})}>
									Delete
								</Button>
							</Cell>
						</>
					);
				}}
			/>
			<Modal size="7xl" title={modalTitle} ref={modalRef}>
				<Form
					className="flex flex-col gap-2 max-h-[600px] overflow-y-auto"
					onSubmit={submit}
					context={{disabled: isPreview, hideButton: isPreview}}>
					<SppbOutModalChild reset={reset} control={control} />
				</Form>
			</Modal>
		</>
	);
}

function useSppbOut() {
	const {data: invoiceId} = trpc.sppb.out.getInvoice.useQuery();
	const {data: dataFg = []} = trpc.sppb.out.getFg.useQuery();
	const {data: dataKendaraan = []} = trpc.basic.get.useQuery<any, TKendaraan[]>(
		{target: CRUD_ENABLED.KENDARAAN},
	);
	const {data: dataCustomer = []} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	return {invoiceId, dataFg, dataKendaraan, dataCustomer};
}

export function SppbOutModalChild({
	control,
	reset,
}: {
	reset: UseFormReset<FormValue>;
	control: Control<FormValue>;
}) {
	const {dataCustomer, dataFg, dataKendaraan, invoiceId} = useSppbOut();

	const formData = useWatch({control});

	const {isDelete} = modalTypeParser(formData.type);

	const selectedCustomer = dataCustomer.find(
		e => e.id === formData.id_customer,
	);
	const availableSppbIn = dataFg.filter(
		e => !!formData?.po?.find(y => y.id_po === e.kanban?.id_po),
	);
	const dataAvailablePo = selectMapper(
		dataFg.filter(
			e => e.kanban.dataSppbIn?.detailPo?.id_customer === formData.id_customer,
		),
		'kanban.id_po',
		'kanban.dataSppbIn.detailPo.nomor_po',
	);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<>
			<Input
				disabled
				control={control}
				label="Nomor Surat"
				fieldName="invoice_no"
				defaultValue={invoiceId}
			/>
			<Input type="date" control={control} fieldName="date" />
			<Select
				control={control}
				fieldName="id_kendaraan"
				data={selectMapper(dataKendaraan, 'id', 'name')}
			/>
			<Select
				control={control}
				fieldName="id_customer"
				data={selectMapper(dataCustomer, 'id', 'name')}
			/>
			{selectedCustomer && (
				<>
					<div>Alamat : {selectedCustomer.alamat}</div>
					<div>No telp : {selectedCustomer.no_telp}</div>
					<div>UP : {selectedCustomer.up}</div>
				</>
			)}

			<Button
				onClick={() =>
					reset(prev => {
						const {po = []} = prev;
						return {
							...prev,
							po: [...po, {id_po: '', sppb_in: [{id_sppb_in: '', items: {}}]}],
						};
					})
				}>
				Add PO
			</Button>

			{formData.po?.map((po, i) => {
				return (
					<>
						<div className="flex gap-2">
							<Select
								className="flex-1"
								key={formData.id_customer}
								control={control}
								fieldName={`po.${i}.id_po`}
								data={dataAvailablePo.filter(
									e =>
										e.value === formData.po![i]!.id_po ||
										!formData.po!.map(y => y.id_po).includes(e.value),
								)}
							/>

							<Button
								onClick={() =>
									reset(prev => {
										const u = prev.po[i];
										u?.sppb_in.push({id_sppb_in: '', items: {}});
										return {
											...prev,
											po: prev.po.replace(i, u!),
										};
									})
								}>
								Add Surat Jalan
							</Button>

							<Button
								onClick={() => {
									reset(prev => {
										return {...prev, po: prev.po.remove(i)};
									});
								}}>
								Delete PO
							</Button>
						</div>
						{po.sppb_in?.map((sppb, ii) => {
							const selectedSppbIn = availableSppbIn.find(
								e => sppb?.id_sppb_in === e.kanban?.dataSppbIn?.id,
							);
							const listItems = Object.entries(
								selectedSppbIn?.kanban.items ?? {},
							);
							const lot_no = selectedSppbIn?.kanban?.dataSppbIn?.lot_no;
							return (
								<>
									<div className="flex gap-2 items-center">
										<Select
											control={control}
											className="flex-1"
											key={`${formData.id_customer}${formData.po?.[i]?.id_po}`}
											fieldName={`po.${i}.sppb_in.${ii}.id_sppb_in`}
											data={selectMapper(
												availableSppbIn,
												'kanban.dataSppbIn.id',
												'kanban.dataSppbIn.nomor_surat',
											).filter(
												e =>
													e.value === po.sppb_in?.[ii]?.id_sppb_in ||
													!po.sppb_in?.map(y => y.id_sppb_in).includes(e.value),
											)}
										/>
										{/* <Input control={control} fieldName={`po.${i}.sppb_in.${ii}.customer_no_lot`} /> */}
										{lot_no && <div>cust no lot : {lot_no}</div>}
										<Button
											onClick={() => {
												reset(prev => {
													const u = prev.po[i]!;
													const sppb_in = u.sppb_in.remove(ii);
													return {
														...prev,
														po: prev.po.replace(i, {...u, sppb_in}),
													};
												});
											}}>
											Delete Surat Jalan
										</Button>
									</div>
									{listItems.map(([id_item, item]) => {
										const detail =
											selectedSppbIn?.kanban.dataSppbIn?.items?.find(
												e => e.id === id_item,
											)?.itemDetail;

										return (
											<div key={id_item} className="flex items-center gap-2">
												<Text className="flex-1">{detail?.name}</Text>
												{qtyMap(({qtyKey, unitKey}) => {
													const jumlah = item[qtyKey];

													if (!jumlah) return null;

													return (
														<Input
															className="flex-1 bg-white"
															key={jumlah}
															type="decimal"
															// @ts-ignore
															defaultValue={jumlah}
															control={control}
															rules={{
																max: {
																	value: jumlah,
																	message: `max is ${jumlah}`,
																},
															}}
															rightAcc={<Text>{detail?.[unitKey]}</Text>}
															fieldName={`po.${i}.sppb_in.${ii}.items.${id_item}.${qtyKey}`}
														/>
													);
												})}
											</div>
										);
									})}
									{/* @ts-ignore */}
									<RenderListMesin data={selectedSppbIn?.kanban.listMesin} />
								</>
							);
						})}
					</>
				);
			})}

			<Button type="submit">Submit</Button>
		</>
	);
}
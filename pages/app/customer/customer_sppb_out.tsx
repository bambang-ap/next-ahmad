import {useRef} from 'react';

import {Control, useForm, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TCustomer,
	TCustomerSPPBOut,
	TKendaraan,
} from '@appTypes/app.zod';
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Text,
} from '@components';
import {defaultErrorMutation} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {RenderListMesin} from '@pageComponent/scan_GenerateQR';
import {qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

SPPBOUT.getLayout = getLayout;

type FormValue = ModalTypePreview & TCustomerSPPBOut;

export default function SPPBOUT() {
	useSppbOut();

	const modalRef = useRef<ModalRef>(null);

	const {control, handleSubmit} = useForm<FormValue>();
	const {mutate} = trpc.sppb.out.upsert.useMutation();

	const submit = handleSubmit(values => {
		mutate(values, defaultErrorMutation);
	});

	return (
		<>
			<Button onClick={() => modalRef.current?.show()}>Add</Button>
			<Modal ref={modalRef}>
				<Form onSubmit={submit}>
					<SPPBOUTe control={control} />
				</Form>
			</Modal>
		</>
	);
}

function useSppbOut() {
	// const {data: invoiceId, refetch} = trpc.sppb.out.get.useQuery();
	const {data: invoiceId, refetch} = trpc.sppb.out.getInvoice.useQuery();
	const {data: dataFg = []} = trpc.sppb.out.getFg.useQuery();
	const {data: dataKendaraan = []} = trpc.basic.get.useQuery<any, TKendaraan[]>(
		{target: CRUD_ENABLED.KENDARAAN},
	);
	const {data: dataCustomer = []} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	return {invoiceId, dataFg, dataKendaraan, dataCustomer};
}

export function SPPBOUTe({control}: {control: Control<FormValue>}) {
	const {dataCustomer, dataFg, dataKendaraan, invoiceId} = useSppbOut();

	const formData = useWatch({control});
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
	const selectedSppbIn = availableSppbIn.find(
		e =>
			formData.po?.[0]?.sppb_in?.[0]?.id_sppb_in === e.kanban?.dataSppbIn?.id,
	);
	const listItems = Object.entries(selectedSppbIn?.kanban.items ?? {});

	return (
		<>
			<Button type="submit" />
			<Input
				disabled
				control={control}
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
			<Select
				key={formData.id_customer}
				control={control}
				fieldName="po.0.id_po"
				data={dataAvailablePo}
			/>
			<Select
				key={`${formData.id_customer}${formData.po?.[0]?.id_po}`}
				control={control}
				fieldName="po.0.sppb_in.0.id_sppb_in"
				data={selectMapper(
					availableSppbIn,
					'kanban.dataSppbIn.id',
					'kanban.dataSppbIn.nomor_surat',
				)}
			/>

			{listItems.map(([id_item, item]) => {
				const detail = selectedSppbIn?.kanban.dataSppbIn?.items?.find(
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
									type="number"
									defaultValue={jumlah}
									control={control}
									rules={{
										max: {value: jumlah, message: `max is ${jumlah}`},
									}}
									rightAcc={<Text>{detail?.[unitKey]}</Text>}
									fieldName={`po.0.sppb_in.0.items.${id_item}.${qtyKey}`}
								/>
							);
						})}
					</div>
				);
			})}

			<RenderListMesin data={selectedSppbIn?.kanban.listMesin} />

			<div>cust no lot :{selectedSppbIn?.kanban?.dataSppbIn?.lot_no}</div>
			{/* <Input control={control} fieldName="po.0.sppb_in.0.customer_no_lot" /> */}
		</>
	);
}

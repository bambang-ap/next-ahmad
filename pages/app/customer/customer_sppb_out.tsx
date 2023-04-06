import {useForm} from 'react-hook-form';

import {ModalTypePreview, TCustomer, TKendaraan} from '@appTypes/app.zod';
import {Button, Form, Input, Select, selectMapper, Text} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {RenderListMesin} from '@pageComponent/scan_GenerateQR';
import {qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

SPPBOUT.getLayout = getLayout;

type FormValue = ModalTypePreview & {
	invoice_no: string;
	date: string;
	id_kendaraan: string;
	id_customer: string;
	po: {
		id_po: string;
		sppb_in: {
			id_sppb_in: string;
			customer_no_lot: string;
		}[];
	}[];
};

export default function SPPBOUT() {
	const {control, handleSubmit, watch} = useForm<FormValue>();

	const {data: invoiceId} = trpc.sppb.out.getInvoice.useQuery();
	const {data: dataFg = []} = trpc.sppb.out.getFg.useQuery();

	const {data: dataKendaraan = []} = trpc.basic.get.useQuery<any, TKendaraan[]>(
		{target: CRUD_ENABLED.KENDARAAN},
	);
	const {data: dataCustomer = []} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	const formData = watch();
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
	const ddd = availableSppbIn.find(
		e => formData.po?.[0]?.sppb_in[0]?.id_sppb_in === e.kanban?.dataSppbIn?.id,
	);

	const submit = handleSubmit(values => console.log(values));

	return (
		<Form onSubmit={submit}>
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

			{Object.entries(ddd?.kanban.items ?? {}).map(([id_item, item]) => {
				const detail = ddd?.kanban.dataPo?.po_item.find(e => e.id === id_item);
				return (
					<>
						<Text>{detail?.name}</Text>
						{qtyMap(({qtyKey, unitKey, num}) => {
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
									fieldName={`${id_item}.${qtyKey}`}
								/>
							);
						})}
						{/* <Input control={control}  /> */}
					</>
				);
			})}

			<RenderListMesin data={ddd?.kanban.listMesin} />

			<div>cust no lot :{ddd?.kanban?.dataSppbIn?.lot_no}</div>
		</Form>
	);
}

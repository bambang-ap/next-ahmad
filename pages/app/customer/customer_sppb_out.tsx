import {useForm} from 'react-hook-form';

import {ModalTypePreview, TCustomer, TKendaraan} from '@appTypes/app.zod';
import {Button, Form, Input, Select, selectMapper} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
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
	const {data: dataPo = []} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
	});
	const {data: dataKendaraan = []} = trpc.basic.get.useQuery<any, TKendaraan[]>(
		{target: CRUD_ENABLED.KENDARAAN},
	);
	const {data: dataCustomer = []} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	const formData = watch();
	const availableSppbIn = dataFg.filter(
		e => !!formData?.po?.find(y => y.id_po === e.kanban?.id_po),
	);
	const dataAvailablePo = selectMapper(
		dataFg,
		'kanban.id_po',
		'kanban.sppbIn.detailPo.nomor_po',
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

			<Select control={control} fieldName="po.0.id_po" data={dataAvailablePo} />
			<Select
				key={formData.po?.[0]?.id_po}
				control={control}
				fieldName="po.0.sppb_in.0.id_sppb_in"
				data={selectMapper(
					availableSppbIn,
					'kanban.sppbIn.id',
					'kanban.sppbIn.nomor_surat',
				)}
			/>
			<div>
				cust no lot :
				{
					availableSppbIn.find(
						e =>
							formData.po?.[0]?.sppb_in[0]?.id_sppb_in === e.kanban?.sppbIn?.id,
					)?.kanban?.sppbIn?.lot_no
				}
			</div>
		</Form>
	);
}

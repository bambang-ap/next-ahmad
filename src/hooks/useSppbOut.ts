import {TCustomer, TKendaraan} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';
import {trpc} from '@utils/trpc';

export function useSppbOut(idCustomer?: string) {
	const {data: invoiceId} = trpc.sppb.out.getInvoice.useQuery();
	const {data: dataFg = []} = trpc.sppb.out.getFg.useQuery(idCustomer, {
		enabled: !!idCustomer,
	});
	const {data: dataKendaraan = []} = trpc.basic.get.useQuery<any, TKendaraan[]>(
		{target: CRUD_ENABLED.KENDARAAN},
	);
	const {data: dataCustomer = []} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	return {invoiceId, dataFg, dataKendaraan, dataCustomer};
}

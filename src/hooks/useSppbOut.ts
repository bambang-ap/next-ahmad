import {TCustomer, TKendaraan} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';
import {trpc} from '@utils/trpc';

export function useSppbOut() {
	const {data: dataKendaraan = []} = trpc.basic.get.useQuery<any, TKendaraan[]>(
		{target: CRUD_ENABLED.KENDARAAN},
	);
	const {data: dataCustomer = []} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});

	return {dataKendaraan, dataCustomer};
}

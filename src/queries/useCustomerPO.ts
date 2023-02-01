import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TCustomerPO} from '@appTypes/app.type';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchCustomerPO = () => axios.get('/api/customer/po');
export const useFetchCustomerPO = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TCustomerPO[]>>(
		['customer_po', data?.user?.id],
		{
			queryFn: fetchCustomerPO,
		},
	);
};

export const useManageCustomerPO = () => {
	const manageCustomerPO =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: '/api/customer/po', method, data});

	return {
		post: useMutation(manageCustomerPO<Omit<TCustomerPO, 'id'>>('POST')),
		put: useMutation(manageCustomerPO<TCustomerPO>('PUT')),
		delete: useMutation(manageCustomerPO<Pick<TCustomerPO, 'id'>>('DELETE')),
	};
};

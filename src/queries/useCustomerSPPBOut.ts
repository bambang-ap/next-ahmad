import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TCustomerSPPBOut} from '@appTypes/app.type';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchCustomerSPPBOut = () => axios.get('/api/customer/sppb_out');
export const useFetchCustomerSPPBOut = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TCustomerSPPBOut[]>>(
		['customer_sppb_out', data?.user?.id],
		{
			queryFn: fetchCustomerSPPBOut,
		},
	);
};

export const useManageCustomerSPPBOut = () => {
	const manageCustomerSPPBOut =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: '/api/customer/sppb_out', method, data});

	return {
		post: useMutation(
			manageCustomerSPPBOut<Omit<TCustomerSPPBOut, 'id'>>('POST'),
		),
		put: useMutation(manageCustomerSPPBOut<TCustomerSPPBOut>('PUT')),
		delete: useMutation(
			manageCustomerSPPBOut<Pick<TCustomerSPPBOut, 'id'>>('DELETE'),
		),
	};
};

import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TCustomerSPPBIn} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchCustomerSPPBIn = () =>
	axios.get(`/api/${CRUD_ENABLED.CUSTOMER_SPPB_IN}`);
export const useFetchCustomerSPPBIn = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TCustomerSPPBIn[]>>(
		['customer_sppb_in', data?.user?.id],
		{
			queryFn: fetchCustomerSPPBIn,
		},
	);
};

export const useManageCustomerSPPBIn = () => {
	const manageCustomerSPPBIn =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: `/api/${CRUD_ENABLED.CUSTOMER_SPPB_IN}`, method, data});

	return {
		post: useMutation(
			manageCustomerSPPBIn<Omit<TCustomerSPPBIn, 'id'>>('POST'),
		),
		put: useMutation(manageCustomerSPPBIn<TCustomerSPPBIn>('PUT')),
		delete: useMutation(
			manageCustomerSPPBIn<Pick<TCustomerSPPBIn, 'id'>>('DELETE'),
		),
	};
};

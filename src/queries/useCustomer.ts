import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TCustomer} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchCustomer = () => axios.get(`/api/${CRUD_ENABLED.CUSTOMER}`);
export const useFetchCustomer = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TCustomer[]>>(['customer', data?.user?.id], {
		queryFn: fetchCustomer,
	});
};

export const useManageCustomer = () => {
	const manageCustomer =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: `/api/${CRUD_ENABLED.CUSTOMER}`, method, data});

	return {
		post: useMutation(manageCustomer<Omit<TCustomer, 'id'>>('POST')),
		put: useMutation(manageCustomer<TCustomer>('PUT')),
		delete: useMutation(manageCustomer<Pick<TCustomer, 'id'>>('DELETE')),
	};
};

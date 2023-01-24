import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TRole} from '@appTypes/app.type';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchRole = () => axios.get('/api/user/role');
export const useFetchRole = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TRole[]>>(['role', data?.user?.id], {
		queryFn: fetchRole,
	});
};

export const useManageRole = () => {
	const manageRole =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: '/api/user/role', method, data});

	return {
		post: useMutation(manageRole<{name?: string}>('POST')),
		put: useMutation(manageRole<{name?: string; id?: number}>('PUT')),
		delete: useMutation(manageRole<{id?: number}>('DELETE')),
	};
};

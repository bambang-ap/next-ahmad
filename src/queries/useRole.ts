import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TRole} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchRole = () => axios.get(`/api/${CRUD_ENABLED.ROLE}`);
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
			axios({url: `/api/${CRUD_ENABLED.ROLE}`, method, data});

	return {
		post: useMutation(manageRole<{name?: string}>('POST')),
		put: useMutation(manageRole<{name?: string; id?: number}>('PUT')),
		delete: useMutation(manageRole<{id?: number}>('DELETE')),
	};
};

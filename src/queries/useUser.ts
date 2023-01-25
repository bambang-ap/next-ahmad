import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TUser} from '@appTypes/app.type';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchUser = () => axios.get('/api/user');
export const useFetchUser = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TUser[]>>(['user', data?.user?.id], {
		queryFn: fetchUser,
	});
};

export const useManageUser = () => {
	const manageUser =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: '/api/user', method, data});

	return {
		post: useMutation(manageUser<TUser>('POST')),
		put: useMutation(manageUser<TUser>('PUT')),
		delete: useMutation(manageUser<Pick<TUser, 'id'>>('DELETE')),
	};
};

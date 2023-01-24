import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TMenu} from '@appTypes/app.type';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchMenu = () => axios.get('/api/menu');
export const useFetchMenu = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TMenu[]>>(['menu', data?.user?.id], {
		queryFn: fetchMenu,
	});
};

export const useManageMenu = () => {
	const manageMenu =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: '/api/menu', method, data});

	return {
		post: useMutation(manageMenu('POST')),
		put: useMutation(manageMenu('PUT')),
		delete: useMutation(manageMenu('DELETE')),
	};
};

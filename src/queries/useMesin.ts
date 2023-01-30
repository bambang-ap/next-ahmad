import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TMesin} from '@appTypes/app.type';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchMesin = () => axios.get('/api/mesin');
export const useFetchMesin = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TMesin[]>>(['role', data?.user?.id], {
		queryFn: fetchMesin,
	});
};

export const useManageMesin = () => {
	const manageMesin =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: '/api/mesin', method, data});

	return {
		post: useMutation(manageMesin<Omit<TMesin, 'id'>>('POST')),
		put: useMutation(manageMesin<TMesin>('PUT')),
		delete: useMutation(manageMesin<Pick<TMesin, 'id'>>('DELETE')),
	};
};

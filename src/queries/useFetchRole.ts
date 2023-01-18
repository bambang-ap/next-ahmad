import {useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TRole} from '@appTypes/app.type';
import {useSession} from '@hooks';

export const useFetchRole = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TRole[]>>(['role', data?.user?.id], {
		queryFn,
	});
};

const queryFn = () => axios.get('/api/user/role');

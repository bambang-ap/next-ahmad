import {useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TUser} from '@appTypes/app.type';
import {useSession} from '@hooks';

export const useFetchUser = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TUser[]>>(['user', data?.user?.id], {
		queryFn,
	});
};

const queryFn = () => axios.get('/api/user');

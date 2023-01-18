import {useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TMenu} from '@appTypes/app.type';
import {useSession} from '@hooks';

export const useFetchMenu = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TMenu[]>>(['menu', data?.user?.id], {
		queryFn,
	});
};

const queryFn = () => axios.get('/api/menu');

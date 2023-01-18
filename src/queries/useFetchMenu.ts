import {useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TMenu} from '@appTypes/app.type';

export const useFetchMenu = () => {
	return useQuery<AxiosResponse<TMenu[]>>(['menu'], {
		queryFn,
	});
};

const queryFn = () => axios.get('/api/menu');

import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';

import {TInstruksiKanban} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';
import {useSession} from '@hooks';
import {Method} from '@queries';

const fetchInstruksiKanban = () =>
	axios.get(`/api/${CRUD_ENABLED.INSTRUKSI_KANBAN}`);
export const useFetchInstruksiKanban = () => {
	const {data} = useSession();

	return useQuery<AxiosResponse<TInstruksiKanban[]>>(
		['InstruksiKanban', data?.user?.id],
		{
			queryFn: fetchInstruksiKanban,
		},
	);
};

export const useManageInstruksiKanban = () => {
	const manageInstruksiKanban =
		<D>(method: Method) =>
		(data: D) =>
			axios({url: `/api/${CRUD_ENABLED.INSTRUKSI_KANBAN}`, method, data});

	return {
		post: useMutation(
			manageInstruksiKanban<Omit<TInstruksiKanban, 'id'>>('POST'),
		),
		put: useMutation(manageInstruksiKanban<TInstruksiKanban>('PUT')),
		delete: useMutation(
			manageInstruksiKanban<Pick<TInstruksiKanban, 'id'>>('DELETE'),
		),
	};
};

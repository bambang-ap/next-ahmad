import {useEffect} from 'react';

import {
	getSession as getSessionNext,
	useSession as useSessionNext,
} from 'next-auth/react';
import {useRouter} from 'next/router';

import {TSession} from '@appTypes/app.type';

import {useMenu} from './useMenu';

export const useAuth = () => {
	const {all: allSub = []} = useMenu();
	const {status} = useSession();
	const {replace, asPath} = useRouter();

	const firstPath = allSub?.[0]?.path!;
	const index = allSub.findIndex(e => e.path === asPath);

	useEffect(() => {
		function targeting() {
			if (asPath.includes('scanRemove')) return;
			if (status === 'unauthenticated') replace('/auth/signin');
			if (status === 'authenticated') {
				if (!asPath.includes('/app')) replace('/app');
				else if (index < 0) replace({pathname: firstPath});
			}
		}

		targeting();
	}, [status, asPath, firstPath, index]);
};

export function useSession() {
	const {status, data} = useSessionNext() ?? {};

	return {status, data: data as TSession};
}

export async function getSession() {
	type Status = Exclude<ReturnType<typeof useSessionNext>['status'], 'loading'>;
	const data = await getSessionNext();

	return {
		status: (!!data ? 'authenticated' : 'unauthenticated') as Status,
		data: data as TSession | null,
	};
}

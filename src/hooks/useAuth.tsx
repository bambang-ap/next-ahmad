import {useEffect} from 'react';

import {
	getSession as getSessionNext,
	useSession as useSessionNext,
} from 'next-auth/react';
import {useSetRecoilState} from 'recoil';

import {TSession} from '@appTypes/app.type';
import {PATHS} from '@enum';
import {useRouter} from '@hooks';
import {atomHeaderTitle} from '@recoil/atoms';
import {isAdminRole} from '@utils';

import {useMenu} from './useMenu';

export const useAuth = () => {
	const setTitle = useSetRecoilState(atomHeaderTitle);

	const {all: allSub = []} = useMenu();
	const {status} = useSession();
	const {replace, asPath} = useRouter();

	const firstPath = allSub?.[0]?.path!;
	const index = allSub.findIndex(e => e.path === asPath);

	useEffect(() => {
		function targeting() {
			if (status === 'unauthenticated') {
				return replace(PATHS.signin);
			}

			if (status === 'authenticated') {
				if (asPath === PATHS.app) {
					setTitle('Landing Page');
					return;
				}

				if (asPath.includes(PATHS.dev_scan_remove)) return;
				if (!asPath.includes(PATHS.app)) replace(PATHS.app);
				else if (asPath.includes('?')) return;
				else if (index < 0) replace({pathname: PATHS.app});
			}
		}

		targeting();
	}, [status, asPath, firstPath, index]);
};

export function useSession() {
	const {status, data} = useSessionNext() ?? {};
	const session = data as TSession;

	return {
		status,
		data: session,
		isAdmin: isAdminRole(session?.user?.role),
	};
}

export async function getSession() {
	type Status = Exclude<ReturnType<typeof useSessionNext>['status'], 'loading'>;
	const data = await getSessionNext();

	return {
		status: (!!data ? 'authenticated' : 'unauthenticated') as Status,
		data: data as TSession | null,
	};
}

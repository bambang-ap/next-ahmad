import {useEffect} from 'react';

import {useSession as useSessionNext} from 'next-auth/react';
import {useRouter} from 'next/router';

import {Session} from '@appTypes/app.type';

export const useAuth = () => {
	const {replace} = useRouter();
	const {status} = useSession();

	useEffect(() => {
		if (status === 'unauthenticated') replace('/auth/signin');
		if (status === 'authenticated') replace('/app');
	}, [status]);
};

export const useSession = () => {
	const {status, data} = useSessionNext();

	return {status, data: data as Session} as const;
};

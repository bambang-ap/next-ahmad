import {useEffect} from 'react';

import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';

export const useAuth = () => {
	const {status} = useSession();
	const {replace} = useRouter();

	useEffect(() => {
		if (status === 'unauthenticated') replace('/auth/signin');
		if (status === 'authenticated') replace('/app');
	}, [status, replace]);
};

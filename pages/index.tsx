import React, {useEffect} from 'react';

import {useAuth} from '@hooks';
import {useRouter} from 'next/router';

import LoginScreen from './login';

export default function Index() {
	const {replace} = useRouter();
	const {isLoggedIn, isFetching} = useAuth();

	useEffect(() => {
		if (isLoggedIn && !isFetching) replace('/app');
	}, [isLoggedIn, isFetching]);

	if (isFetching) return <div>Loading</div>;

	return <LoginScreen />;
}

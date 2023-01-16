import './globals.css';

import React from 'react';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RecoilRoot} from 'recoil';
import {AppPropsWithLayout} from 'src/appTypes/props.type';

const queryClient = new QueryClient();

export default function App({Component, pageProps}: AppPropsWithLayout) {
	const getLayout = Component.getLayout ?? (page => page);

	return (
		<QueryClientProvider client={queryClient}>
			<RecoilRoot>{getLayout(<Component {...pageProps} />)}</RecoilRoot>
		</QueryClientProvider>
	);
}

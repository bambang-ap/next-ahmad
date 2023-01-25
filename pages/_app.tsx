import './globals.css';
import 'global-methods';

import React, {Suspense} from 'react';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SessionProvider} from 'next-auth/react';
import {ReactQueryDevtools} from 'node_modules/@tanstack/react-query-devtools/build/lib/devtools';
import {RecoilRoot} from 'recoil';
import {AppPropsWithLayout} from 'src/appTypes/props.type';

const queryClient = new QueryClient({
	defaultOptions: {queries: {refetchOnWindowFocus: false}},
});

export default function App({
	Component,
	pageProps: {session, ...pageProps},
}: AppPropsWithLayout) {
	const getLayout = Component.getLayout ?? (page => page);

	return (
		<Suspense>
			<QueryClientProvider client={queryClient}>
				<ReactQueryDevtools />
				<RecoilRoot>
					<SessionProvider
						session={session}
						refetchInterval={30000}
						refetchWhenOffline={false}
						refetchOnWindowFocus={false}>
						{getLayout(<Component {...pageProps} />)}
					</SessionProvider>
				</RecoilRoot>
			</QueryClientProvider>
		</Suspense>
	);
}

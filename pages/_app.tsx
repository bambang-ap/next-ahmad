import 'global-methods';
import './globals.css';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Flowbite} from 'flowbite-react';
import {SessionProvider} from 'next-auth/react';
import {ReactQueryDevtools} from 'node_modules/@tanstack/react-query-devtools/build/lib/devtools';
import {RecoilRoot} from 'recoil';
import {AppPropsWithLayout} from 'src/appTypes/props.type';

import {themeClassName} from '@tailwind/theme';

const queryClient = new QueryClient({
	defaultOptions: {queries: {refetchOnWindowFocus: false}},
});

export default function App({
	Component,
	pageProps: {session, ...pageProps},
}: AppPropsWithLayout) {
	const getLayout = Component.getLayout ?? (page => page);

	return (
		<Flowbite
			theme={{
				dark: true,
				theme: themeClassName,
			}}>
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
		</Flowbite>
	);
}

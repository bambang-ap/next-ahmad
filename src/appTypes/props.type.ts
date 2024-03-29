import {ReactNode} from 'react';

import {NextPage} from 'next';
import {AppProps} from 'next/app';

export type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

export type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactNode) => ReactNode;
	authPage?: (page: ReactNode) => ReactNode;
};

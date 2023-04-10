import {ReactNode} from 'react';

import {NextPage} from 'next';
import {AppProps} from 'next/app';
import {FieldValues, UseFormReturn} from 'react-hook-form';

export type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

export type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactNode) => ReactNode;
	authPage?: (page: ReactNode) => ReactNode;
};

export type FormScreenProps<
	F extends FieldValues,
	K extends keyof T = 'control',
	T extends UseFormReturn<F> = UseFormReturn<F>,
> = Partial<Omit<T, K>> & Pick<T, K>;

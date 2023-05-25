import {ReactNode} from "react";

import {NextPage} from "next";
import {AppProps} from "next/app";
import {FieldValues, UseFormReturn} from "react-hook-form";

import {TKategoriMesin, TMasterItem, TMesin} from "./app.type";

export type ErrorMessage = {message: string};

export type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

export type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactNode) => ReactNode;
	authPage?: (page: ReactNode) => ReactNode;
};

/**
 * @param F FieldValues
 * @param K Required Keys
 * @param T Don't pass anything, its only for typing check
 */
export type FormScreenProps<
	F extends FieldValues,
	K extends keyof T = "control",
	T extends UseFormReturn<F> = UseFormReturn<F>,
> = Partial<Omit<T, K>> & Pick<T, K>;

export type ScanIds = {key: string; id: string};

export type ItemDetail =
	| (TMasterItem & {
			OrmKategoriMesin: TKategoriMesin;
			availableMesins: TMesin[];
	  })
	| undefined;

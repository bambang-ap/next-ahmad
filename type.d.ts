type TNextApi = (req: NextApiRequest, res: NextApiResponse) => void;
type KeyOf<T extends {}> = (keyof T)[];
type OfKey<T extends string[]> = T[number];

// declare module 'next' {
// 	import type {ReactElement, ReactNode} from 'react';

// 	export declare type NextPage<P = {}, IP = P> = NextComponentType<
// 		NextPageContext,
// 		IP,
// 		P
// 	> & {
// 		getLayout?: (page: ReactElement) => ReactNode;
// 	};
// }

declare namespace NodeJS {
	interface ProcessEnv {
		AUTH_SECRET: string;

		PGSQL_DATABASE: string;

		PROD_PGSQL_USER: string;
		PROD_PGSQL_PASSWORD: string;
		PROD_PGSQL_HOST: string;
		PROD_PGSQL_PORT: number;

		DEV_PGSQL_USER: string;
		DEV_PGSQL_PASSWORD: string;
		DEV_PGSQL_HOST: string;
		DEV_PGSQL_PORT: number;

		VERCEL_URL?: string;
		VERCEL_URL?: string;
		RENDER_INTERNAL_HOSTNAME?: string;
		RENDER_INTERNAL_HOSTNAME?: string;
		PORT?: string;
	}
}

declare module "react-qr-scanner" {
	import {HTMLAttributes} from "react";
	export type QRResult = {text: string} | null;
	export type QRReaderProps = {
		delay?: number;
		style?: HTMLAttributes<HTMLDivElement>["style"];
		onScan: (result: QRResult) => void;
		onError: (err: any) => void;
	};

	function QRReader(props: QRReaderProps): JSX.Element;

	export default QRReader;
}

type Join<K, P> = K extends string | number
	? P extends string | number
		? `${K}${"" extends P ? "" : "."}${P}`
		: never
	: never;

type Prev = [
	never,
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20,
	...0[],
];

type Paths<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
	? {
			[K in keyof T]-?: K extends string | number
				? `${K}` | Join<K, Paths<T[K], Prev[D]>>
				: never;
	  }[keyof T]
	: "";

type Leaves<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
	? {[K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>>}[keyof T]
	: "";

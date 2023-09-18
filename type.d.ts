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

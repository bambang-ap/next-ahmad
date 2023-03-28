type TNextApi = (req: NextApiRequest, res: NextApiResponse) => void;
declare namespace NodeJS {
	interface ProcessEnv {
		AUTH_SECRET: string;
		PGSQL_USER: string;
		PGSQL_PASSWORD: string;
		PGSQL_HOST: string;
		PGSQL_PORT: number;
		PGSQL_DATABASE: string;
	}
}

declare module 'react-qr-scanner' {
	import {HTMLAttributes} from 'react';

	export type QRResult = {text: string} | null;
	export type QRReaderProps = {
		delay?: number;
		style?: HTMLAttributes<HTMLDivElement>['style'];
		onScan?: (result: QRResult) => void;
	};

	function QRReader(props: QRReaderProps): JSX.Element;

	export default QRReader;
}

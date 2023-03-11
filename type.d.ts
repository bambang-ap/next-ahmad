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

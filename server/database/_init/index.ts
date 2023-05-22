import {ModelDefined, Optional, Sequelize} from "sequelize";

import {initOrm} from "./init-orm";
import {initRelations} from "./init-relations";

export type DefinedModel<
	T extends {},
	K extends keyof T = never,
> = ModelDefined<T, Optional<T, K>>;

const {
	NODE_ENV,
	PROD_PGSQL_USER,
	PROD_PGSQL_PASSWORD,
	PROD_PGSQL_HOST,
	DEV_PGSQL_USER,
	DEV_PGSQL_PASSWORD,
	DEV_PGSQL_HOST,
	PROD_PGSQL_PORT,
	DEV_PGSQL_PORT,
} = process.env;

const isProd = NODE_ENV === "production";

export const ORM = new Sequelize(
	"manajemen",
	isProd ? PROD_PGSQL_USER : DEV_PGSQL_USER,
	isProd ? PROD_PGSQL_PASSWORD : DEV_PGSQL_PASSWORD,
	{
		dialect: "postgres",
		port: isProd ? PROD_PGSQL_PORT : DEV_PGSQL_PORT,
		host: isProd ? PROD_PGSQL_HOST : DEV_PGSQL_HOST,
		// query: {raw: true},
		logging: false,
	},
);

initOrm(ORM).then(initRelations);

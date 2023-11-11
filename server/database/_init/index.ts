import {ModelDefined, Optional, Sequelize} from 'sequelize';

import {isProd} from '@constants';

import {initOrm} from './init-orm';
import {initRelations} from './init-relations';

export type DefinedModel<
	T extends {},
	K extends keyof T = never,
> = ModelDefined<T, Optional<T, K>>;

const {
	PROD_PGSQL_USER,
	PROD_PGSQL_PASSWORD,
	PROD_PGSQL_HOST,
	DEV_PGSQL_USER,
	DEV_PGSQL_PASSWORD,
	DEV_PGSQL_HOST,
	PROD_PGSQL_PORT,
	DEV_PGSQL_PORT,
	PGSQL_DATABASE,
} = process.env;

export const ORM = new Sequelize(
	PGSQL_DATABASE,
	isProd ? PROD_PGSQL_USER : DEV_PGSQL_USER,
	isProd ? PROD_PGSQL_PASSWORD : DEV_PGSQL_PASSWORD,
	{
		// query: {raw: true},
		// logging: isProd ? false : true,
		dialect: 'postgres',
		port: isProd ? PROD_PGSQL_PORT : DEV_PGSQL_PORT,
		host: isProd ? PROD_PGSQL_HOST : DEV_PGSQL_HOST,
		logging: false,
		minifyAliases: true,
		pool: {
			max: 10,
			min: 1,
			maxUses: 250,
			idle: 10 * 1000,
			evict: 1000 * 2.5,
			acquire: 1000 * 60 * 5,
		},
	},
);

initOrm(ORM).then(initRelations);

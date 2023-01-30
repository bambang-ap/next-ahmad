import {ModelDefined, Optional, Sequelize} from 'sequelize';

export type DefinedModel<
	T extends {},
	K extends keyof T = never,
> = ModelDefined<T, Optional<T, K>>;

export const defaultExcludeColumn = ['createdAt', 'updatedAt'];

export const ORM = new Sequelize(
	'manajemen',
	// @ts-ignore
	process.env.PGSQL_USER,
	process.env.PGSQL_PASSWORD,
	{
		dialect: 'postgres',
		host: process.env.PGSQL_HOST,
	},
);

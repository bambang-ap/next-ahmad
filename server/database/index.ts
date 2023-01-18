import {DataTypes, Sequelize} from 'sequelize';

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

export const OrmUser = ORM.define(
	'User',
	{
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		role: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{tableName: 'user'},
);

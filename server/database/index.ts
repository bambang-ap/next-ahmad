import {DataTypes, Sequelize} from 'sequelize';

const defaultExcludeColumn = ['createdAt', 'updatedAt'];

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
		email: {type: DataTypes.STRING, allowNull: false},
		name: {type: DataTypes.STRING, allowNull: false},
		password: {type: DataTypes.STRING, allowNull: false},
		role: {type: DataTypes.STRING, allowNull: false},
	},
	{
		tableName: 'user',
		defaultScope: {
			attributes: {
				exclude: [...defaultExcludeColumn, 'password'],
			},
		},
	},
);

export const OrmRole = ORM.define(
	'Role',
	{
		name: {type: DataTypes.STRING, allowNull: false},
	},
	{
		tableName: 'role',
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

export const OrmMenu = ORM.define(
	'Menu',
	{
		title: {type: DataTypes.STRING, allowNull: false},
		parent_id: {type: DataTypes.STRING},
		icon: {type: DataTypes.STRING},
		path: {type: DataTypes.STRING},
		accepted_role: {type: DataTypes.STRING, allowNull: false},
	},
	{
		tableName: 'menu',
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

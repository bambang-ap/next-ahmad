import {DataTypes} from 'sequelize';

import {TUser} from '@appTypes/app.type';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmUser: DefinedModel<TUser> = ORM.define(
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

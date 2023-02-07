import {DataTypes} from 'sequelize';

import {TUser} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmUser: DefinedModel<TUser> = ORM.define(
	CRUD_ENABLED.USER,
	{
		email: {type: DataTypes.STRING, allowNull: false},
		name: {type: DataTypes.STRING, allowNull: false},
		password: {type: DataTypes.STRING, allowNull: false},
		role: {type: DataTypes.STRING, allowNull: false},
	},
	{
		tableName: CRUD_ENABLED.USER,
		defaultScope: {
			attributes: {
				exclude: [...defaultExcludeColumn, 'password'],
			},
		},
	},
);

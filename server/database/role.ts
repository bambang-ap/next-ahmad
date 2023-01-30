import {DataTypes} from 'sequelize';

import {TRole} from '@appTypes/app.type';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmRole: DefinedModel<TRole, 'id'> = ORM.define(
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

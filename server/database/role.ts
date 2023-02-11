import {DataTypes} from 'sequelize';

import {TRole} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmRole: DefinedModel<TRole, 'id'> = ORM.define(
	CRUD_ENABLED.ROLE,
	{
		name: {type: DataTypes.STRING, allowNull: false},
	},
	{
		tableName: CRUD_ENABLED.ROLE,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

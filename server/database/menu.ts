import {DataTypes} from 'sequelize';

import {TMenu} from '@appTypes/app.type';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmMenu: DefinedModel<Omit<TMenu, 'subMenu'>> = ORM.define(
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

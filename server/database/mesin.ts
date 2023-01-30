import {DataTypes} from 'sequelize';

import {TMesin} from '@appTypes/app.type';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmMesin: DefinedModel<TMesin> = ORM.define(
	'Mesin',
	{
		name: {type: DataTypes.STRING},
		nomor_mesin: {type: DataTypes.STRING},
	},
	{
		tableName: 'mesin',
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

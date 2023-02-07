import {DataTypes} from 'sequelize';

import {TMesin} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmMesin: DefinedModel<TMesin> = ORM.define(
	CRUD_ENABLED.MESIN,
	{
		name: {type: DataTypes.STRING},
		nomor_mesin: {type: DataTypes.STRING},
	},
	{
		tableName: CRUD_ENABLED.MESIN,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

import {DataTypes} from 'sequelize';

import {TCustomer} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomer: DefinedModel<TCustomer> = ORM.define(
	CRUD_ENABLED.CUSTOMER,
	{
		name: {type: DataTypes.STRING},
	},
	{
		tableName: CRUD_ENABLED.CUSTOMER,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

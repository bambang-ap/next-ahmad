import {DataTypes} from 'sequelize';

import {TCustomer} from '@appTypes/app.type';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomer: DefinedModel<TCustomer> = ORM.define(
	'Customer',
	{
		name: {type: DataTypes.STRING},
	},
	{
		tableName: 'customer',
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

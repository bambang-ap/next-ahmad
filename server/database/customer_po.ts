import {DataTypes} from 'sequelize';

import {TCustomerPO} from '@appTypes/app.type';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerPO: DefinedModel<TCustomerPO> = ORM.define(
	'CustomerPO',
	{
		name: {type: DataTypes.STRING},
	},
	{
		tableName: 'customer_po',
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

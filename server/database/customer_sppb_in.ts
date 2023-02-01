import {DataTypes} from 'sequelize';

import {TCustomerSPPBIn} from '@appTypes/app.type';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerSPPBIn: DefinedModel<TCustomerSPPBIn> = ORM.define(
	'CustomerSPPBIn',
	{
		name: {type: DataTypes.STRING},
	},
	{
		tableName: 'customer_sppb_in',
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

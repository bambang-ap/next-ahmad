import {DataTypes} from 'sequelize';

import {TCustomerSPPBOut} from '@appTypes/app.type';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerSPPBOut: DefinedModel<TCustomerSPPBOut> = ORM.define(
	'CustomerSPPBOut',
	{
		name: {type: DataTypes.STRING},
	},
	{
		tableName: 'customer_sppb_out',
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

import {DataTypes} from 'sequelize';

import {TCustomerSPPBOut} from '@appTypes/app.type';
import {TABLES} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerSPPBOut: DefinedModel<TCustomerSPPBOut> = ORM.define(
	TABLES.CUSTOMER_SPPB_OUT,
	{
		name: {type: DataTypes.STRING},
		id_po: {type: DataTypes.STRING},
	},
	{
		tableName: TABLES.CUSTOMER_SPPB_OUT,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

import {DataTypes} from 'sequelize';

import {TCustomerSPPBIn} from '@appTypes/app.type';
import {TABLES} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerSPPBIn: DefinedModel<TCustomerSPPBIn> = ORM.define(
	TABLES.CUSTOMER_SPPB_IN,
	{
		name: {type: DataTypes.STRING},
		nomor_po: {type: DataTypes.STRING},
		items: DataTypes.JSONB,
	},
	{
		tableName: TABLES.CUSTOMER_SPPB_IN,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

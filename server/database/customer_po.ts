import {DataTypes} from 'sequelize';

import {TCustomerPO} from '@appTypes/app.type';
import {TABLES} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerPO: DefinedModel<TCustomerPO> = ORM.define(
	TABLES.CUSTOMER_PO,
	{
		name: {type: DataTypes.STRING},
		id_customer: {type: DataTypes.STRING},
		nomor_po: {type: DataTypes.STRING},
	},
	{
		tableName: TABLES.CUSTOMER_PO,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

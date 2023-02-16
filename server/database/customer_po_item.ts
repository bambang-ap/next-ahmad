import {DataTypes} from 'sequelize';

import {TPOItem} from '@appTypes/app.type';
import {TABLES} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerPOItem: DefinedModel<TPOItem> = ORM.define(
	TABLES.CUSTOMER_PO_ITEM,
	{
		name: {type: DataTypes.STRING},
		nomor_po: {type: DataTypes.STRING},
	},
	{
		tableName: TABLES.CUSTOMER_PO_ITEM,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

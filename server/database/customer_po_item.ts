import {STRING} from 'sequelize';

import {TPOItem} from '@appTypes/app.type';
import {TABLES} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerPOItem: DefinedModel<TPOItem> = ORM.define(
	TABLES.CUSTOMER_PO_ITEM,
	{
		name: {type: STRING},
		nomor_po: {type: STRING},
		qty: {type: STRING},
		unit: STRING,
		kode_item: STRING,
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

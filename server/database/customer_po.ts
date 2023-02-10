import {DataTypes} from 'sequelize';

import {TCustomerPO} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerPO: DefinedModel<TCustomerPO> = ORM.define(
	CRUD_ENABLED.CUSTOMER_PO,
	{
		name: {type: DataTypes.STRING},
		id_customer: {type: DataTypes.STRING},
		nomor_po: {type: DataTypes.STRING},
	},
	{
		tableName: CRUD_ENABLED.CUSTOMER_PO,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

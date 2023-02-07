import {DataTypes} from 'sequelize';

import {TCustomerSPPBIn} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmCustomerSPPBIn: DefinedModel<TCustomerSPPBIn> = ORM.define(
	CRUD_ENABLED.CUSTOMER_SPPB_IN,
	{
		name: {type: DataTypes.STRING},
	},
	{
		tableName: CRUD_ENABLED.CUSTOMER_SPPB_IN,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	},
);

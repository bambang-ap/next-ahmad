import {DataTypes, Model, Sequelize} from 'sequelize';

import {TCustomerSPPBOut} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmCustomerSPPBOut extends Model<TCustomerSPPBOut> {}

export default function initOrmCustomerSPPBOut(sequelize: Sequelize) {
	OrmCustomerSPPBOut.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			items: DataTypes.JSONB,
			nomor_po: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_SPPB_OUT,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomerSPPBOut;
}

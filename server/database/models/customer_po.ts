import {DataTypes, Model, Sequelize} from 'sequelize';

import {TCustomerPO} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmCustomerPO extends Model<TCustomerPO> {}

export default function initOrmCustomerPO(sequelize: Sequelize) {
	OrmCustomerPO.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			id_customer: {type: DataTypes.STRING},
			nomor_po: {type: DataTypes.STRING},
			tgl_po: {type: DataTypes.STRING},
			due_date: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_PO,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomerPO;
}

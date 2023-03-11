import {DataTypes, Model, Sequelize, STRING} from 'sequelize';

import {TPOItem} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmCustomerPOItem extends Model<TPOItem> {}

export default function initOrmCustomerPOItem(sequelize: Sequelize) {
	OrmCustomerPOItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: STRING},
			nomor_po: {type: STRING},
			qty: {type: STRING},
			unit: STRING,
			kode_item: STRING,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_PO_ITEM,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomerPOItem;
}

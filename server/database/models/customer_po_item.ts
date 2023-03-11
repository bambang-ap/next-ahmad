import {DataTypes, Model, NUMBER, Sequelize, STRING} from 'sequelize';

import {TPOItem} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmCustomerPOItem extends Model<TPOItem> {}

export default function initOrmCustomerPOItem(sequelize: Sequelize) {
	OrmCustomerPOItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_po: {type: STRING},
			name: {type: STRING},
			qty1: NUMBER,
			unit1: STRING,
			qty2: NUMBER,
			unit2: STRING,
			qty3: NUMBER,
			unit3: STRING,
			qty4: NUMBER,
			unit4: STRING,
			qty5: NUMBER,
			unit5: STRING,
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

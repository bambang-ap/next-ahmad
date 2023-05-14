import {DataTypes, DECIMAL, Model, Sequelize, STRING} from "sequelize";

import {TPOItem} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmCustomerPOItem extends Model<TPOItem> {}

export const unitQtyField = {
	qty1: DECIMAL,
	qty2: DECIMAL,
	qty3: DECIMAL,
	qty4: DECIMAL,
	qty5: DECIMAL,
};

export default function initOrmCustomerPOItem(sequelize: Sequelize) {
	OrmCustomerPOItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_po: {type: STRING},
			name: {type: STRING},
			kode_item: STRING,
			harga: DECIMAL,
			unit1: STRING,
			unit2: STRING,
			unit3: STRING,
			unit4: STRING,
			unit5: STRING,
			...unitQtyField,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_PO_ITEM,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomerPOItem;
}

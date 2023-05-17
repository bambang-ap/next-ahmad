import {DataTypes, Model, Sequelize, STRING} from "sequelize";

import {TPOItem} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

import {ormDecimalType} from "../db-utils";

export class OrmCustomerPOItem extends Model<TPOItem> {}

export const unitQtyField = {
	qty1: ormDecimalType("qty1"),
	qty2: ormDecimalType("qty2"),
	qty3: ormDecimalType("qty3"),
	qty4: ormDecimalType("qty4"),
	qty5: ormDecimalType("qty5"),
};

export default function initOrmCustomerPOItem(sequelize: Sequelize) {
	OrmCustomerPOItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_po: {type: STRING},
			name: {type: STRING},
			kode_item: STRING,
			harga: ormDecimalType("harga"),
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

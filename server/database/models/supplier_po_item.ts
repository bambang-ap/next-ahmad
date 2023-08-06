import {DataTypes, Model, Sequelize, STRING} from "sequelize";

import {TSupplierPOItem} from "@appTypes/app.zod";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmSupplierPOItem extends Model<TSupplierPOItem> {}

export default function initOrmSupplierPOItem(sequelize: Sequelize) {
	OrmSupplierPOItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			harga: STRING,
			id_po: STRING,
			id_supplier_item: STRING,
			qty: STRING,
			unit: STRING,
		},
		{
			sequelize,
			tableName: TABLES.SUPPLIER_PO_ITEM,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmSupplierPOItem;
}

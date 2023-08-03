import {DataTypes, Model, Sequelize} from "sequelize";

import {TSupplierItem} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmSupplierItem extends Model<TSupplierItem> {
	static _alias = "SupplierItem";
}

export default function initOrmSupplierItem(sequelize: Sequelize) {
	OrmSupplierItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			code_item: {type: DataTypes.STRING},
			name_item: {type: DataTypes.STRING},
			harga: {type: DataTypes.NUMBER},
		},
		{
			sequelize,
			tableName: TABLES.SUPPLIER_ITEM,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmSupplierItem;
}

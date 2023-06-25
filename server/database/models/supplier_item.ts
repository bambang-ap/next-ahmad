import {DataTypes, Model, Sequelize} from "sequelize";

import {TSupplierItem} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmSupplierItem extends Model<TSupplierItem> {}

export default function initOrmSupplierItem(sequelize: Sequelize) {
	OrmSupplierItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_supplier: {type: DataTypes.STRING},
			code_item: {type: DataTypes.STRING},
			name_item: {type: DataTypes.STRING},
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

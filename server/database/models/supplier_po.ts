import {DataTypes, Model, Sequelize} from "sequelize";

import {TSupplierPO} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmSupplierPO extends Model<TSupplierPO> {}

export default function initOrmSupplierPO(sequelize: Sequelize) {
	OrmSupplierPO.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_supplier: {type: DataTypes.STRING},
			items: {type: DataTypes.JSONB},
		},
		{
			sequelize,
			tableName: TABLES.SUPPLIER_PO,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmSupplierPO;
}

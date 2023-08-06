import {BOOLEAN, DataTypes, Model, NUMBER, Sequelize, STRING} from "sequelize";

import {TSupplierPO} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmSupplierPO extends Model<TSupplierPO> {}

export default function initOrmSupplierPO(sequelize: Sequelize) {
	OrmSupplierPO.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			ppn: BOOLEAN,
			tgl_po: STRING,
			tgl_req_send: STRING,
			keterangan: STRING,
			ppn_percentage: NUMBER,
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

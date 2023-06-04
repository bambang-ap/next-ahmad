import {DataTypes, Model, Sequelize} from "sequelize";

import {TScan} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmScan extends Model<TScan> {}

export default function initOrmScan(sequelize: Sequelize) {
	OrmScan.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_kanban: DataTypes.STRING,
			lot_no_imi: DataTypes.STRING,
			status_produksi: DataTypes.BOOLEAN,
			status_qc: DataTypes.BOOLEAN,
			id_customer: DataTypes.BOOLEAN,
			status_finish_good: DataTypes.BOOLEAN,
			status_out_barang: DataTypes.BOOLEAN,
			item_finish_good: DataTypes.JSON,
			item_out_barang: DataTypes.JSON,
			item_produksi: DataTypes.JSON,
			item_qc: DataTypes.JSON,
		},
		{
			sequelize,
			tableName: TABLES.SCAN,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmScan;
}

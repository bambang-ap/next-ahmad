import {DataTypes, JSONB, Model, Sequelize} from "sequelize";

import {TScan} from "@appTypes/app.type";
import {defaultExcludeColumn} from "@constants";
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
			// status_out_barang: DataTypes.BOOLEAN,
			// item_out_barang: DataTypes.JSON,
			item_finish_good: DataTypes.JSONB,
			item_produksi: DataTypes.JSONB,
			item_qc: DataTypes.JSONB,
			item_qc_reject: JSONB,
			notes: DataTypes.TEXT,
			date: JSONB,
			item_from_kanban: JSONB,
			item_qc_reject_category: JSONB,
		},
		{
			sequelize,
			tableName: TABLES.SCAN,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmScan;
}

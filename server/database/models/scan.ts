import {DataTypes, Model, Sequelize} from 'sequelize';

import {TScan} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmScan extends Model<TScan> {}

export default function initOrmScan(sequelize: Sequelize) {
	OrmScan.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_kanban: DataTypes.STRING,
			status_produksi: DataTypes.BOOLEAN,
			status_qc: DataTypes.BOOLEAN,
			status_finish_good: DataTypes.BOOLEAN,
			status_out_barang: DataTypes.BOOLEAN,
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
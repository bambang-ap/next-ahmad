import {DataTypes, Model, Sequelize} from 'sequelize';

import {TKanban} from '@appTypes/app.zod';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmKanban extends Model<TKanban> {}

export default function initOrmKanban(sequelize: Sequelize) {
	OrmKanban.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_instruksi_kanban: {type: DataTypes.STRING},
			id_mesin: {type: DataTypes.STRING},
			nomor_po: {type: DataTypes.STRING},
			id_sppb_in: DataTypes.STRING,
			items: DataTypes.JSONB,
		},
		{
			sequelize,
			tableName: TABLES.KANBAN,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmKanban;
}

import {DataTypes, Model, Sequelize} from 'sequelize';

import {TKanban} from '@appTypes/app.zod';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmKanban extends Model<TKanban> {}

export default function initOrmKanban(sequelize: Sequelize) {
	OrmKanban.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_po: {type: DataTypes.STRING},
			id_sppb_in: DataTypes.STRING,
			keterangan: DataTypes.STRING,
			mesin_id: DataTypes.JSONB,
			instruksi_id: DataTypes.JSONB,
			createdBy: DataTypes.STRING,
			updatedBy: DataTypes.STRING,
			hardnessId: DataTypes.STRING,
			parameterId: DataTypes.STRING,
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

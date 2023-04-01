import {DataTypes, Model, Sequelize} from 'sequelize';

import {THardnessKategori} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmHardnessKategori extends Model<THardnessKategori> {}

export default function initOrmHardnessKategori(sequelize: Sequelize) {
	OrmHardnessKategori.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.HARDNESS_KATEGORI,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmHardnessKategori;
}

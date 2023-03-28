import {DataTypes, Model, Sequelize} from 'sequelize';

import {TMaterialKategori} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmMaterialKategori extends Model<TMaterialKategori> {}

export default function initOrmMaterialKategori(sequelize: Sequelize) {
	OrmMaterialKategori.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.MATERIAL_KATEGORI,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmMaterialKategori;
}

import {DataTypes, Model, Sequelize} from 'sequelize';

import {TMaterial} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmMaterial extends Model<TMaterial> {}

export default function initOrmMaterial(sequelize: Sequelize) {
	OrmMaterial.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			id_kategori: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.MATERIAL,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmMaterial;
}

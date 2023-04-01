import {DataTypes, Model, Sequelize} from 'sequelize';

import {TParameterKategori} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmParameterKategori extends Model<TParameterKategori> {}

export default function initOrmParameterKategori(sequelize: Sequelize) {
	OrmParameterKategori.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.PARAMETER_KATEGORI,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmParameterKategori;
}

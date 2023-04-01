import {DataTypes, Model, Sequelize} from 'sequelize';

import {TParameter} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmParameter extends Model<TParameter> {}

export default function initOrmParameter(sequelize: Sequelize) {
	OrmParameter.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			id_kategori: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.PARAMETER,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmParameter;
}

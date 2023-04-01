import {DataTypes, Model, Sequelize} from 'sequelize';

import {THardness} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmHardness extends Model<THardness> {}

export default function initOrmHardness(sequelize: Sequelize) {
	OrmHardness.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			id_kategori: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.HARDNESS,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmHardness;
}

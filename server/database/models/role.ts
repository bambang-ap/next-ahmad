import {DataTypes, Model, Sequelize} from 'sequelize';

import {TRole} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmRole extends Model<TRole> {}

export default function initOrmRole(sequelize: Sequelize) {
	OrmRole.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING, allowNull: false},
		},
		{
			sequelize,
			tableName: TABLES.ROLE,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmRole;
}

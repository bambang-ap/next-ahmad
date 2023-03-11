import {
	DataTypes,
	InitOptions,
	Model,
	ModelAttributes,
	Optional,
	Sequelize,
} from 'sequelize';

import {TRole} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmRole extends Model<TRole> {}

export function ormRoleAttributes(): [
	ModelAttributes<OrmRole, Optional<TRole, never>>,
	Omit<InitOptions<OrmRole>, 'sequelize'>,
] {
	return [
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING, allowNull: false},
		},
		{
			tableName: TABLES.ROLE,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	];
}

export default function initOrmRole(sequelize: Sequelize) {
	const [attributes, options] = ormRoleAttributes();
	OrmRole.init(attributes, {sequelize, ...options});

	return OrmRole;
}

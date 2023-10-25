import {
	DataTypes,
	InitOptions,
	Model,
	ModelAttributes,
	Optional,
	Sequelize,
} from 'sequelize';

import {TUser} from '@appTypes/app.type';
import {defaultExcludeColumn, defaultOrderBy} from '@constants';
import {TABLES} from '@enum';

export class OrmUser extends Model<TUser> {
	static _alias = 'dataUser' as const;
}

export function ormUserAttributes(): [
	ModelAttributes<OrmUser, Optional<TUser, never>>,
	Omit<InitOptions<OrmUser>, 'sequelize'>,
] {
	return [
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			email: {type: DataTypes.STRING},
			name: {type: DataTypes.STRING},
			password: {type: DataTypes.STRING},
			role: {type: DataTypes.STRING},
		},
		{
			tableName: TABLES.USER,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: [...defaultExcludeColumn, 'password'],
				},
			},
		},
	];
}

export default function initOrmUser(sequelize: Sequelize) {
	const [attributes, options] = ormUserAttributes();
	OrmUser.init(attributes, {...options, sequelize});

	return OrmUser;
}

export class dUser extends Model<TUser> {
	static _alias = 'dataUser' as const;
}

export function dUserAttributes(): [
	ModelAttributes<dUser, Optional<TUser, never>>,
	Omit<InitOptions<dUser>, 'sequelize'>,
] {
	return [
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			email: {type: DataTypes.STRING},
			name: {type: DataTypes.STRING},
			password: {type: DataTypes.STRING},
			role: {type: DataTypes.STRING},
		},
		{
			tableName: TABLES.USER,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: [...defaultExcludeColumn, 'password'],
				},
			},
		},
	];
}

export function initUser(sequelize: Sequelize) {
	const [attributes, options] = dUserAttributes();
	dUser.init(attributes, {...options, sequelize});

	return dUser;
}

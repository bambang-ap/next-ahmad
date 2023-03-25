import {
	DataTypes,
	InitOptions,
	Model,
	ModelAttributes,
	Optional,
	Sequelize,
} from 'sequelize';

import {TUserLogin} from '@appTypes/app.zod';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmUserLogin extends Model<TUserLogin> {}

export function ormUserLoginAttributes(): [
	ModelAttributes<OrmUserLogin, Optional<TUserLogin, never>>,
	Omit<InitOptions<OrmUserLogin>, 'sequelize'>,
] {
	return [
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_user: {type: DataTypes.STRING},
			expiredAt: {type: DataTypes.DATE},
		},
		{
			tableName: TABLES.USER_LOGIN,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	];
}

export default function initOrmCustomerLogin(sequelize: Sequelize) {
	const [attributes, options] = ormUserLoginAttributes();
	OrmUserLogin.init(attributes, {...options, sequelize});

	return OrmUserLogin;
}

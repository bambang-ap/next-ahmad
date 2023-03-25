import {DataTypes, Model, Sequelize} from 'sequelize';

import {TUserLogin} from '@appTypes/app.zod';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmUserLogin extends Model<TUserLogin> {}

export default function initOrmCustomerLogin(sequelize: Sequelize) {
	OrmUserLogin.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_user: {type: DataTypes.STRING},
			expiredAt: {type: DataTypes.DATE},
		},
		{
			sequelize,
			tableName: TABLES.USER_LOGIN,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmUserLogin;
}

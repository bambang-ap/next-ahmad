import {BOOLEAN, DataTypes, Model, Sequelize, STRING} from 'sequelize';

import {TCustomer} from '@appTypes/app.type';
import {defaultExcludeColumn, defaultOrderBy} from '@constants';
import {CRUD_ENABLED} from '@enum';

export class OrmCustomer extends Model<TCustomer> {}

export default function initOrmCustomer(sequelize: Sequelize) {
	OrmCustomer.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			alamat: {type: DataTypes.STRING},
			no_telp: {type: DataTypes.STRING},
			npwp: {type: DataTypes.STRING},
			up: {type: DataTypes.STRING},
			ppn: BOOLEAN,
			keterangan: STRING,
		},
		{
			sequelize,
			tableName: CRUD_ENABLED.CUSTOMER,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomer;
}

export class dCust extends Model<TCustomer> {}

export function initCust(sequelize: Sequelize) {
	dCust.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			alamat: {type: DataTypes.STRING},
			no_telp: {type: DataTypes.STRING},
			npwp: {type: DataTypes.STRING},
			up: {type: DataTypes.STRING},
			ppn: BOOLEAN,
			keterangan: STRING,
		},
		{
			sequelize,
			tableName: CRUD_ENABLED.CUSTOMER,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return dCust;
}

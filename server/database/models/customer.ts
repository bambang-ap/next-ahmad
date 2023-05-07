import {DataTypes, Model, Sequelize} from "sequelize";

import {TCustomer} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {CRUD_ENABLED} from "@enum";

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

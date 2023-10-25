import {DataTypes, Model, Sequelize} from 'sequelize';

import {TSupplier} from '@appTypes/app.type';
import {defaultExcludeColumn, defaultOrderBy} from '@constants';
import {TABLES} from '@enum';

export class OrmSupplier extends Model<TSupplier> {
	static _alias = 'Supplier' as const;
}

export default function initOrmSupplier(sequelize: Sequelize) {
	OrmSupplier.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			alamat: {type: DataTypes.STRING},
			phone: {type: DataTypes.STRING},
			npwp: {type: DataTypes.STRING},
			up: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.SUPPLIER,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmSupplier;
}

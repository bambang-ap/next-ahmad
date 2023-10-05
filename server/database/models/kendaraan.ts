import {DataTypes, Model, Sequelize} from "sequelize";

import {TKendaraan} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmKendaraan extends Model<TKendaraan> {}

export default function initOrmKendaraan(sequelize: Sequelize) {
	OrmKendaraan.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.KENDARAAN,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmKendaraan;
}

export class dVehicle extends Model<TKendaraan> {}

export function initVehicle(sequelize: Sequelize) {
	dVehicle.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.KENDARAAN,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return dVehicle;
}

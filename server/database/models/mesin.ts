import {DataTypes, Model, Sequelize} from "sequelize";

import {TMesin} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmMesin extends Model<TMesin> {}

export default function initOrmMesin(sequelize: Sequelize) {
	OrmMesin.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			nomor_mesin: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.MESIN,
			defaultScope: {
				...defaultOrderBy,
				order: [["nomor_mesin", "asc"]],
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmMesin;
}

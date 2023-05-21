import {DataTypes, Model, Sequelize} from "sequelize";

import {TKategoriMesin} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmKategoriMesin extends Model<TKategoriMesin> {}

export default function initOrmKategoriMesin(sequelize: Sequelize) {
	OrmKategoriMesin.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.MESIN_KATEGORI,
			defaultScope: {
				...defaultOrderBy,
				order: [["name", "asc"]],
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmKategoriMesin;
}

import {DataTypes, Model, Sequelize} from "sequelize";

import {TKanban} from "@appTypes/app.zod";
import {defaultExcludeColumn} from "@constants";
import {TABLES} from "@enum";

export class OrmKanban extends Model<TKanban> {
	static _aliasCreatedBy = "dataCreatedBy" as const;
	static _aliasUpdatedBy = "dataUpdatedBy" as const;
}

export default function initOrmKanban(sequelize: Sequelize) {
	OrmKanban.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_po: {type: DataTypes.STRING},
			printed: {type: DataTypes.NUMBER},
			id_sppb_in: DataTypes.STRING,
			keterangan: DataTypes.STRING,
			createdBy: DataTypes.STRING,
			updatedBy: DataTypes.STRING,
			image: DataTypes.STRING,
			nomor_kanban: DataTypes.STRING,
			list_mesin: DataTypes.JSONB,
			doc_id: DataTypes.STRING,
		},
		{
			sequelize,
			tableName: TABLES.KANBAN,
			defaultScope: {
				// ...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmKanban;
}

export class dKanban extends Model<TKanban> {
	static _aliasCreatedBy = "dataCreatedBy" as const;
	static _aliasUpdatedBy = "dataUpdatedBy" as const;
}

export function initDKanban(sequelize: Sequelize) {
	dKanban.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_po: {type: DataTypes.STRING},
			printed: {type: DataTypes.NUMBER},
			id_sppb_in: DataTypes.STRING,
			keterangan: DataTypes.STRING,
			createdBy: DataTypes.STRING,
			updatedBy: DataTypes.STRING,
			image: DataTypes.STRING,
			nomor_kanban: DataTypes.STRING,
			list_mesin: DataTypes.JSONB,
			doc_id: DataTypes.STRING,
		},
		{
			sequelize,
			tableName: TABLES.KANBAN,
			defaultScope: {
				// ...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return dKanban;
}

import {DataTypes, Model, Sequelize} from "sequelize";

import {TMasterItem} from "@appTypes/app.zod";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmMasterItem extends Model<TMasterItem> {}

export default function initOrmMasterItem(sequelize: Sequelize) {
	OrmMasterItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			kode_item: {type: DataTypes.STRING},
			material: {type: DataTypes.JSONB},
			parameter: {type: DataTypes.JSONB},
			hardness: {type: DataTypes.JSONB},
			process: {type: DataTypes.JSONB},
		},
		{
			sequelize,
			tableName: TABLES.ITEM,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmMasterItem;
}

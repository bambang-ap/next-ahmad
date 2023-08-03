import {DataTypes, Model, Sequelize, STRING} from "sequelize";

import {TSupItemRelation} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmSupItemRelation extends Model<TSupItemRelation> {}

export default function initOrmSupItemRelation(sequelize: Sequelize) {
	OrmSupItemRelation.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			item_id: STRING,
			supplier_id: STRING,
		},
		{
			sequelize,
			tableName: TABLES.SUPPLIER_ITEM_RELATION,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmSupItemRelation;
}

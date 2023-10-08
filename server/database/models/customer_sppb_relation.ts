import {DataTypes, Model, Sequelize, STRING} from "sequelize";

import {TSPPBRelation} from "@appTypes/app.zod";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class dSppbBridge extends Model<TSPPBRelation> {}

export default function initSppbBridge(sequelize: Sequelize) {
	dSppbBridge.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			in_id: STRING,
			out_id: STRING,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_SPPB_RELATION,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return dSppbBridge;
}

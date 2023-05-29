import {DataTypes, Model, Sequelize} from "sequelize";

import {TDocument} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmDocument extends Model<TDocument> {}

export default function initOrmDocument(sequelize: Sequelize) {
	OrmDocument.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			doc_no: {type: DataTypes.STRING},
			tgl_efektif: {type: DataTypes.STRING},
			keterangan: {type: DataTypes.STRING},
		},
		{
			sequelize,
			tableName: TABLES.DOCUMENT,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmDocument;
}

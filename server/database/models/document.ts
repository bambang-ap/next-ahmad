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
			revisi: {type: DataTypes.STRING},
			terbit: {type: DataTypes.STRING},
			tgl_efektif: {type: DataTypes.STRING},
			keterangan: {type: DataTypes.STRING},
			// target: STRING,
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

export class dDoc extends Model<TDocument> {}

export function initdDoc(sequelize: Sequelize) {
	dDoc.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			doc_no: {type: DataTypes.STRING},
			revisi: {type: DataTypes.STRING},
			terbit: {type: DataTypes.STRING},
			tgl_efektif: {type: DataTypes.STRING},
			keterangan: {type: DataTypes.STRING},
			// target: STRING,
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

	return dDoc;
}

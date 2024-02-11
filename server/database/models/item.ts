import {ARRAY, DataTypes, JSONB, Model, Sequelize, STRING} from 'sequelize';

import {TMasterItem} from '@appTypes/app.zod';
import {defaultExcludeColumn, defaultOrderBy} from '@constants';
import {TABLES} from '@enum';

import {ormDecimalType} from '../db-utils';

export class OrmMasterItem extends Model<TMasterItem> {}

export default function initOrmMasterItem(sequelize: Sequelize) {
	OrmMasterItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			kode_item: {type: DataTypes.STRING},
			instruksi: JSONB,
			kategori_mesinn: ARRAY(STRING),
			kategori_mesin: STRING,
			keterangan: STRING,
			harga: ormDecimalType('harga'),
			unit_notes: JSONB,
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

export class dItem extends Model<TMasterItem> {}

export function initDItem(sequelize: Sequelize) {
	dItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			kode_item: {type: DataTypes.STRING},
			instruksi: JSONB,
			kategori_mesinn: ARRAY(STRING),
			kategori_mesin: STRING,
			keterangan: STRING,
			harga: ormDecimalType('harga'),
			unit_notes: JSONB,
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

	return dItem;
}

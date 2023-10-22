import {BOOLEAN, Model, Sequelize, STRING} from 'sequelize';

import {SItem, SPo, SPoItem, SSupplier} from '@appTypes/app.zod';
import {defaultScope, ormDecimalType} from '@database';
import {INTERNAL_TABLES} from '@enum';

export class dSItem extends Model<SItem> {}
export function initSItem(sequelize: Sequelize) {
	dSItem.init(
		{
			id: {type: STRING, primaryKey: true},
			kode: STRING,
			nama: STRING,
			ppn: BOOLEAN,
			sup_id: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.ITEM,
		},
	);

	return dSItem;
}

export class dSSUp extends Model<SSupplier> {}
export function initSSup(sequelize: Sequelize) {
	dSSUp.init(
		{
			id: {type: STRING, primaryKey: true},
			alamat: STRING,
			npwp: STRING,
			nama: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.SUPPLIER,
		},
	);

	return dSSUp;
}

export class dSPo extends Model<SPo> {}
export function initSPo(sequelize: Sequelize) {
	dSPo.init(
		{
			id: {type: STRING, primaryKey: true},
			date: STRING,
			due_date: STRING,
			sup_id: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.PO,
		},
	);

	return dSPo;
}

export class dSPoItem extends Model<SPoItem> {}
export function initSPoItem(sequelize: Sequelize) {
	dSPoItem.init(
		{
			id: {type: STRING, primaryKey: true},
			discount: ormDecimalType('discount'),
			harga: ormDecimalType('discount'),
			qty: ormDecimalType('qty'),
			id_item: STRING,
			id_po: STRING,
			unit: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.PO_ITEM,
		},
	);

	return dSPoItem;
}

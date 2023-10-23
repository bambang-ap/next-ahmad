import {BOOLEAN, Model, Sequelize, STRING} from 'sequelize';

import {
	SInItem,
	SItem,
	SPo,
	SPoItem,
	SSjIn,
	SSupplier,
} from '@appTypes/app.zod';
import {defaultScope, ormDecimalType} from '@database';
import {INTERNAL_TABLES} from '@enum';

export class oItem extends Model<SItem> {}
export function initOItem(sequelize: Sequelize) {
	oItem.init(
		{
			id: {type: STRING, primaryKey: true},
			kode: STRING,
			nama: STRING,
			ppn: BOOLEAN,
			sup_id: STRING,
			harga: ormDecimalType('harga'),
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.ITEM,
		},
	);

	return oItem;
}

export class oSup extends Model<SSupplier> {}
export function initOSup(sequelize: Sequelize) {
	oSup.init(
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

	return oSup;
}

export class oPo extends Model<SPo> {}
export function initOPo(sequelize: Sequelize) {
	oPo.init(
		{
			id: {type: STRING, primaryKey: true},
			date: STRING,
			due_date: STRING,
			sup_id: STRING,
			nomor_po: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.PO,
		},
	);

	return oPo;
}

export class oPoItem extends Model<SPoItem> {}
export function initOPoItem(sequelize: Sequelize) {
	oPoItem.init(
		{
			id: {type: STRING, primaryKey: true},
			discount: ormDecimalType('discount'),
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

	return oPoItem;
}

export class oSjIn extends Model<SSjIn> {}
export function initOSjIn(sequelize: Sequelize) {
	oSjIn.init(
		{
			id: {type: STRING, primaryKey: true},
			date: STRING,
			id_po: STRING,
			sup_id: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.PO_ITEM,
		},
	);

	return oSjIn;
}

export class oInItem extends Model<SInItem> {}
export function initOInItem(sequelize: Sequelize) {
	oInItem.init(
		{
			id: {type: STRING, primaryKey: true},
			qty: ormDecimalType('qty'),
			id_item: STRING,
			in_id: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.PO_ITEM,
		},
	);

	return oInItem;
}

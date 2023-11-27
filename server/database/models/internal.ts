import {BOOLEAN, JSONB, Model, Sequelize, STRING} from 'sequelize';

import {
	SInItem,
	SItem,
	SOutBarang,
	SPo,
	SPoItem,
	SReqForm,
	SSjIn,
	SStock,
	SSupplier,
} from '@appTypes/app.zod';
import {defaultScope, ormDecimalType} from '@database';
import {INTERNAL_TABLES} from '@enum';

export class oStock extends Model<SStock> {}
export function initOStock(sequelize: Sequelize) {
	oStock.init(
		{
			id: {type: STRING, primaryKey: true},
			id_item: STRING,
			sup_id: STRING,
			kode: STRING,
			nama: STRING,
			ppn: BOOLEAN,
			unit: STRING,
			id_item_in: STRING,
			qty: ormDecimalType('qty'),
			harga: ormDecimalType('harga'),
		},
		{
			...defaultScope(sequelize, false),
			tableName: INTERNAL_TABLES.STOCK,
		},
	);

	return oStock;
}

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
			telp: STRING,
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
			...defaultScope(sequelize, false),
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
			updatedAt: STRING,
		},
		{
			...defaultScope(sequelize, false),
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
			no_sj: STRING,
			no_lpb: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.SJ_IN,
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
			in_id: STRING,
			keterangan: STRING,

			id_item: STRING,

			harga: STRING,
			kode: STRING,
			nama: STRING,
			unit: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.SJ_IN_ITEM,
		},
	);

	return oInItem;
}

export class oForm extends Model<SReqForm> {}
export function initOForm(sequelize: Sequelize) {
	oForm.init(
		{
			id: {type: STRING, primaryKey: true},
			date: STRING,
			due_date: STRING,
			items: JSONB,
			status: STRING,
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.REQUEST,
		},
	);

	return oForm;
}

export class oOut extends Model<SOutBarang> {}
export function initOOut(sequelize: Sequelize) {
	oOut.init(
		{
			id: {type: STRING, primaryKey: true},
			user: STRING,
			id_stock: STRING,
			keterangan: STRING,
			qty: ormDecimalType('qty'),
		},
		{
			...defaultScope(sequelize),
			tableName: INTERNAL_TABLES.OUT,
		},
	);

	return oOut;
}

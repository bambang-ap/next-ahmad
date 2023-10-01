import {BOOLEAN, Model, Sequelize, STRING} from "sequelize";

import {TScanNew, TScanNewItem, TScanRejectItem} from "@appTypes/app.type";
import {defaultExcludeColumn} from "@constants";
import {TABLES} from "@enum";

import {unitQtyField} from "./customer_po_item";

export class OrmScanNew extends Model<TScanNew> {}

export function initOrmScanNew(sequelize: Sequelize) {
	OrmScanNew.init(
		{
			id: {type: STRING, primaryKey: true},
			id_kanban: STRING,
			lot_no_imi: STRING,
			id_customer: STRING,
			status: STRING,
			notes: STRING,
			is_rejected: BOOLEAN,
		},
		{
			sequelize,
			tableName: TABLES.NEW_SCAN,
			defaultScope: {attributes: {exclude: defaultExcludeColumn}},
		},
	);

	return OrmScanNew;
}

export class OrmScanNewItem extends Model<TScanNewItem> {}

export function initOrmScanNewItem(sequelize: Sequelize) {
	OrmScanNewItem.init(
		{
			...unitQtyField,
			id_scan: STRING,
			id_kanban_item: STRING,
			id: {type: STRING, primaryKey: true},
		},
		{
			sequelize,
			tableName: TABLES.NEW_SCAN_ITEM,
			defaultScope: {attributes: {exclude: defaultExcludeColumn}},
		},
	);

	return OrmScanNewItem;
}

export class OrmScanNewItemReject extends Model<TScanRejectItem> {}

export function initOrmScanNewItemReject(sequelize: Sequelize) {
	OrmScanNewItemReject.init(
		{
			...unitQtyField,
			id_item: STRING,
			reason: STRING,
			id: {type: STRING, primaryKey: true},
		},
		{
			sequelize,
			tableName: TABLES.NEW_SCAN_ITEM_REJECT,
			defaultScope: {attributes: {exclude: defaultExcludeColumn}},
		},
	);

	return OrmScanNewItemReject;
}

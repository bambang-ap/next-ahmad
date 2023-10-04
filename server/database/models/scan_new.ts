import {BOOLEAN, JSONB, Model, Sequelize, STRING} from "sequelize";

import {TScanNew, TScanNewItem, TScanRejectItem} from "@appTypes/app.type";
import {defaultExcludeColumn} from "@constants";
import {TABLES} from "@enum";

import {unitQtyField} from "./customer_po_item";

export class dScan extends Model<TScanNew> {
	static _aliasReject = "rejScan" as const;
}

export function initdScan(sequelize: Sequelize) {
	dScan.init(
		{
			id: {type: STRING, primaryKey: true},
			id_kanban: STRING,
			lot_no_imi: STRING,
			id_customer: STRING,
			status: STRING,
			notes: STRING,
			is_rejected: BOOLEAN,
			id_po: STRING,
			id_qc: STRING,
		},
		{
			sequelize,
			tableName: TABLES.NEW_SCAN,
			defaultScope: {attributes: {exclude: defaultExcludeColumn}},
		},
	);

	return dScan;
}

export class dScanItem extends Model<TScanNewItem> {}

export function initdScanItem(sequelize: Sequelize) {
	dScanItem.init(
		{
			...unitQtyField,
			id_scan: STRING,
			id_kanban_item: STRING,
			id: {type: STRING, primaryKey: true},
			item_from_kanban: JSONB,
		},
		{
			sequelize,
			tableName: TABLES.NEW_SCAN_ITEM,
			defaultScope: {attributes: {exclude: defaultExcludeColumn}},
		},
	);

	return dScanItem;
}

export class dRejItem extends Model<TScanRejectItem> {}

export function initdRejItem(sequelize: Sequelize) {
	dRejItem.init(
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

	return dRejItem;
}

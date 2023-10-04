import {DataTypes, Model, Sequelize, STRING} from "sequelize";

import {TCustomerSPPBOutItem} from "@appTypes/app.type";
import {defaultExcludeColumn} from "@constants";
import {TABLES} from "@enum";

import {unitQtyField} from "./customer_po_item";

export class OrmCustomerSPPBOutItem extends Model<TCustomerSPPBOutItem> {}

export default function initOrmCustomerSPPBOutItem(sequelize: Sequelize) {
	OrmCustomerSPPBOutItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_item: STRING,
			id_sppb_out: STRING,
			...unitQtyField,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_SPPB_OUT_ITEM,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomerSPPBOutItem;
}

export class dOutItem extends Model<TCustomerSPPBOutItem> {}

export function initOutItem(sequelize: Sequelize) {
	dOutItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_item: STRING,
			id_sppb_out: STRING,
			...unitQtyField,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_SPPB_OUT_ITEM,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return dOutItem;
}

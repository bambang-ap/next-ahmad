import {DataTypes, Model, Sequelize, STRING} from 'sequelize';

import {TPOItemSppbIn} from '@appTypes/app.zod';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

import {unitQtyField} from './customer_po_item';

export class OrmPOItemSppbIn extends Model<TPOItemSppbIn> {}

export default function initOrmPOItemSppbIn(sequelize: Sequelize) {
	OrmPOItemSppbIn.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_item: STRING,
			id_sppb_in: STRING,
			...unitQtyField,
		},
		{
			sequelize,
			tableName: TABLES.PO_ITEM_SPPB_IN,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmPOItemSppbIn;
}
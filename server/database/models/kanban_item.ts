import {DataTypes, Model, Sequelize, STRING} from 'sequelize';

import {TKanbanItem} from '@appTypes/app.zod';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

import {unitQtyField} from './customer_po_item';

export class OrmKanbanItem extends Model<TKanbanItem> {}

export default function initOrmKanbanItem(sequelize: Sequelize) {
	OrmKanbanItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_item: STRING,
			master_item_id: STRING,
			id_item_po: STRING,
			id_kanban: STRING,
			id_mesin: STRING,
			...unitQtyField,
		},
		{
			sequelize,
			tableName: TABLES.KANBAN_ITEM,
			defaultScope: {
				// ...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmKanbanItem;
}

export class dKnbItem extends Model<TKanbanItem> {}

export function initDKanbanItem(sequelize: Sequelize) {
	dKnbItem.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			id_item: STRING,
			master_item_id: STRING,
			id_item_po: STRING,
			id_kanban: STRING,
			...unitQtyField,
		},
		{
			sequelize,
			tableName: TABLES.KANBAN_ITEM,
			defaultScope: {
				// ...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return dKnbItem;
}

import {DataTypes, Model, Sequelize} from 'sequelize';

import {TInstruksiKanban} from '@appTypes/app.type';
import {defaultExcludeColumn, defaultOrderBy} from '@constants';
import {TABLES} from '@enum';

export class OrmKanbanInstruksi extends Model<TInstruksiKanban> {}

export default function initOrmKanbanInstruksi(sequelize: Sequelize) {
	OrmKanbanInstruksi.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING, allowNull: false},
		},
		{
			sequelize,
			tableName: TABLES.INSTRUKSI_KANBAN,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmKanbanInstruksi;
}

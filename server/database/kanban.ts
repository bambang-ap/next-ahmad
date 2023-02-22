import {DataTypes} from 'sequelize';

import {TInstruksiKanban} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmKanbanInstruksi: DefinedModel<TInstruksiKanban> = ORM.define(
	CRUD_ENABLED.INSTRUKSI_KANBAN,
	{
		name: {type: DataTypes.STRING, allowNull: false},
	},
	{
		tableName: CRUD_ENABLED.INSTRUKSI_KANBAN,
		defaultScope: {
			attributes: {
				exclude: [...defaultExcludeColumn, 'password'],
			},
		},
	},
);

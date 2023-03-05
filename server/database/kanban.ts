import {DataTypes} from 'sequelize';

import {TKanban} from '@appTypes/app.zod';
import {TABLES} from '@enum';

import {defaultExcludeColumn, DefinedModel, ORM} from './_init';

export const OrmKanban: DefinedModel<TKanban> = ORM.define(
	TABLES.KANBAN,
	{
		id_instruksi_kanban: {type: DataTypes.STRING},
		id_mesin: {type: DataTypes.STRING},
		nomor_po: {type: DataTypes.STRING},
		id_sppb_in: DataTypes.STRING,
		items: DataTypes.JSONB,
	},
	{
		tableName: TABLES.KANBAN,
		defaultScope: {
			attributes: {
				exclude: [...defaultExcludeColumn, 'password'],
			},
		},
	},
);

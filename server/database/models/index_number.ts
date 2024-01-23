import {DataTypes, Model, Sequelize, STRING} from 'sequelize';

import {TIndex} from '@appTypes/app.zod';
import {defaultExcludeColumn, defaultOrderBy} from '@constants';
import {TABLES} from '@enum';

export class dIndex extends Model<TIndex> {
	static _alias1 = 'indexAlias1' as const;
	static _alias2 = 'indexAlias2' as const;
	static _alias3 = 'indexAlias3' as const;
}

export function initDIndex(sequelize: Sequelize) {
	dIndex.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			prefix: STRING,
			target: STRING,
			keterangan: STRING,
		},
		{
			sequelize,
			tableName: TABLES.INDEX_NUMBER,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return dIndex;
}

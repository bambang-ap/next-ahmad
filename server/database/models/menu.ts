import {DataTypes, Model, Sequelize} from 'sequelize';

import {TMenu} from '@appTypes/app.zod';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmMenu extends Model<TMenu> {}

export default function initOrmMenu(sequelize: Sequelize) {
	OrmMenu.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			title: {type: DataTypes.STRING, allowNull: false},
			parent_id: {type: DataTypes.STRING},
			icon: {type: DataTypes.STRING},
			path: {type: DataTypes.STRING},
			accepted_role: {type: DataTypes.STRING, allowNull: false},
			index: {type: DataTypes.NUMBER, allowNull: false},
		},
		{
			sequelize,
			tableName: TABLES.MENU,
			defaultScope: {
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmMenu;
}

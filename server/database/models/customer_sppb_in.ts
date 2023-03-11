import {DataTypes, Model, Sequelize} from 'sequelize';

import {TCustomerSPPBIn} from '@appTypes/app.type';
import {defaultExcludeColumn} from '@constants';
import {TABLES} from '@enum';

export class OrmCustomerSPPBIn extends Model<TCustomerSPPBIn> {}

export default function initOrmCustomerSPPBIn(sequelize: Sequelize) {
	OrmCustomerSPPBIn.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			name: {type: DataTypes.STRING},
			nomor_po: {type: DataTypes.STRING},
			items: DataTypes.JSONB,
			tgl: DataTypes.STRING,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_SPPB_IN,
			defaultScope: {
				order: [['nomor_po', 'asc']],
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomerSPPBIn;
}

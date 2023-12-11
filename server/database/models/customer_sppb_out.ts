import {Model, Sequelize, STRING} from 'sequelize';

import {TCustomerSPPBOut} from '@appTypes/app.type';
import {defaultExcludeColumn, defaultOrderBy} from '@constants';
import {TABLES} from '@enum';

export class OrmCustomerSPPBOut extends Model<TCustomerSPPBOut> {}

export default function initOrmCustomerSPPBOut(sequelize: Sequelize) {
	OrmCustomerSPPBOut.init(
		{
			id: {type: STRING, primaryKey: true},
			date: STRING,
			id_customer: STRING,
			id_kendaraan: STRING,
			invoice_no: STRING,
			keterangan: STRING,
			index_id: STRING,
			index_number: STRING,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_SPPB_OUT,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomerSPPBOut;
}

export class dSjOut extends Model<TCustomerSPPBOut> {}

export function initSjOut(sequelize: Sequelize) {
	dSjOut.init(
		{
			id: {type: STRING, primaryKey: true},
			date: STRING,
			id_customer: STRING,
			id_kendaraan: STRING,
			invoice_no: STRING,
			keterangan: STRING,
			index_id: STRING,
			index_number: STRING,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_SPPB_OUT,
			defaultScope: {
				...defaultOrderBy,
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return dSjOut;
}

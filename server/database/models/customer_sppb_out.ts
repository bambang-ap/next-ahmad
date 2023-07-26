import {DataTypes, Model, Sequelize} from "sequelize";

import {TCustomerSPPBOut} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmCustomerSPPBOut extends Model<TCustomerSPPBOut> {}

export default function initOrmCustomerSPPBOut(sequelize: Sequelize) {
	OrmCustomerSPPBOut.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			date: DataTypes.STRING,
			id_customer: DataTypes.STRING,
			id_kendaraan: DataTypes.STRING,
			invoice_no: DataTypes.STRING,
			keterangan: DataTypes.STRING,
			po: DataTypes.JSONB,
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

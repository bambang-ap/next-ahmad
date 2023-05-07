import {DataTypes, Model, Sequelize} from "sequelize";

import {TCustomerSPPBIn} from "@appTypes/app.type";
import {defaultExcludeColumn, defaultOrderBy} from "@constants";
import {TABLES} from "@enum";

export class OrmCustomerSPPBIn extends Model<TCustomerSPPBIn> {}

export default function initOrmCustomerSPPBIn(sequelize: Sequelize) {
	OrmCustomerSPPBIn.init(
		{
			id: {type: DataTypes.STRING, primaryKey: true},
			nomor_surat: {type: DataTypes.STRING},
			tgl: DataTypes.STRING,
			id_po: DataTypes.STRING,
			lot_no: DataTypes.STRING,
		},
		{
			sequelize,
			tableName: TABLES.CUSTOMER_SPPB_IN,
			defaultScope: {
				order: [
					...defaultOrderBy.order,
					["tgl", "asc"],
					["nomor_surat", "asc"],
				],
				attributes: {
					exclude: defaultExcludeColumn,
				},
			},
		},
	);

	return OrmCustomerSPPBIn;
}

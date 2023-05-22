import {Model, ModelStatic} from "sequelize";

import {OrmCustomer} from "../models/customer";
import {OrmCustomerPO} from "../models/customer_po";
import {OrmCustomerPOItem} from "../models/customer_po_item";
import {OrmMasterItem} from "../models/item";
import {OrmKategoriMesin} from "../models/mesin_kategori";

function relation<M extends object, B extends object>(
	sourceOrm: ModelStatic<Model<M>>,
	targetOrm: ModelStatic<Model<B>>,
	sourceForeignKey: keyof M,
	targetForeignKey: keyof B,
	alias?: string,
) {
	sourceOrm.hasMany(targetOrm, {
		as: alias,
		foreignKey: sourceForeignKey as string,
	});
	targetOrm.belongsTo(sourceOrm, {
		as: alias,
		foreignKey: targetForeignKey as string,
	});
}

export function initRelations() {
	relation(OrmMasterItem, OrmCustomerPOItem, "id", "master_item_id");
	relation(OrmKategoriMesin, OrmMasterItem, "id", "kategori_mesin");
	relation(OrmCustomer, OrmCustomerPO, "id", "id_customer");
	// relation(OrmCustomerPOItem, OrmPOItemSppbIn, "id", "kategori_mesin");
}

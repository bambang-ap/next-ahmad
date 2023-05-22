import {Model, ModelStatic} from "sequelize";

import {OrmCustomerPOItem} from "../models/customer_po_item";
import {OrmMasterItem} from "../models/item";
import {OrmKategoriMesin} from "../models/mesin_kategori";

function relation<M extends object, B extends object>(
	sourceOrm: ModelStatic<Model<M>>,
	targetOrm: ModelStatic<Model<B>>,
	sourceForeignKey: keyof M,
	targetForeignKey: keyof B,
) {
	sourceOrm.hasMany(targetOrm, {foreignKey: sourceForeignKey as string});
	targetOrm.belongsTo(sourceOrm, {foreignKey: targetForeignKey as string});
}

export function initRelations() {
	relation(OrmMasterItem, OrmCustomerPOItem, "id", "master_item_id");
	relation(OrmKategoriMesin, OrmMasterItem, "id", "kategori_mesin");
}

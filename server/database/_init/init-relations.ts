import {Model, ModelStatic} from "sequelize";

import {OrmCustomer} from "../models/customer";
import {OrmCustomerPO} from "../models/customer_po";
import {OrmCustomerPOItem} from "../models/customer_po_item";
import {OrmDocument} from "../models/document";
import {OrmMasterItem} from "../models/item";
import {OrmKanban} from "../models/kanban";
import {OrmMesin} from "../models/mesin";
import {OrmKategoriMesin} from "../models/mesin_kategori";
import {OrmUser} from "../models/user";

function relation<M extends object, B extends object>(
	sourceOrm: ModelStatic<Model<M>>,
	targetOrm: ModelStatic<Model<B>>,
	sourceForeignKey: keyof M | [foreignKey: keyof M, alias: string][],
	targetForeignKey: keyof B | [foreignKey: keyof B, alias: string][],
	alias?: string,
) {
	function hasMany(foreignKey: string, as?: string) {
		sourceOrm.hasMany(targetOrm, {as, foreignKey});
	}
	function belongsTo(foreignKey: string, as?: string) {
		targetOrm.belongsTo(sourceOrm, {as, foreignKey});
	}

	if (Array.isArray(sourceForeignKey)) {
		sourceForeignKey.forEach(([foreignKey, as]) => {
			hasMany(foreignKey as string, as);
		});
	} else hasMany(sourceForeignKey as string, alias);

	if (Array.isArray(targetForeignKey)) {
		targetForeignKey.forEach(([foreignKey, as]) => {
			belongsTo(foreignKey as string, as);
		});
	} else belongsTo(targetForeignKey as string, alias);
}

export function initRelations() {
	relation(OrmMasterItem, OrmCustomerPOItem, "id", "master_item_id");
	relation(OrmKategoriMesin, OrmMasterItem, "id", "kategori_mesin");
	relation(
		OrmKategoriMesin,
		OrmMesin,
		"id",
		"kategori_mesin",
		OrmKategoriMesin._alias,
	);
	relation(OrmCustomer, OrmCustomerPO, "id", "id_customer");
	relation(OrmCustomerPO, OrmKanban, "id", "id_po");
	relation(OrmDocument, OrmKanban, "id", "doc_id");
	relation(OrmUser, OrmKanban, "id", [
		["createdBy", OrmKanban._aliasCreatedBy],
		["updatedBy", OrmKanban._aliasUpdatedBy],
	]);
	// relation(OrmCustomerPOItem, OrmPOItemSppbIn, "id", "kategori_mesin");
}

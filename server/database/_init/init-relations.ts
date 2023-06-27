import {Model, ModelStatic} from "sequelize";

import {OrmCustomer} from "../models/customer";
import {OrmCustomerPO} from "../models/customer_po";
import {OrmCustomerPOItem} from "../models/customer_po_item";
import {OrmCustomerSPPBOut} from "../models/customer_sppb_out";
import {OrmDocument} from "../models/document";
import {OrmMasterItem} from "../models/item";
import {OrmKanban} from "../models/kanban";
import {OrmKanbanItem} from "../models/kanban_item";
import {OrmKendaraan} from "../models/kendaraan";
import {OrmMesin} from "../models/mesin";
import {OrmKategoriMesin} from "../models/mesin_kategori";
import {OrmPOItemSppbIn} from "../models/po_item_sppb_in";
import {OrmSupplier} from "../models/supplier";
import {OrmSupplierItem} from "../models/supplier_item";
import {OrmSupplierPO} from "../models/supplier_po";
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
	relation(OrmMasterItem, OrmKanbanItem, "id", "master_item_id");
	relation(OrmKategoriMesin, OrmMasterItem, "id", "kategori_mesin");
	relation(
		OrmKategoriMesin,
		OrmMesin,
		"id",
		"kategori_mesin",
		OrmKategoriMesin._alias,
	);
	relation(OrmCustomer, OrmCustomerPO, "id", "id_customer");
	relation(OrmCustomer, OrmCustomerSPPBOut, "id", "id_customer");
	relation(OrmKendaraan, OrmCustomerSPPBOut, "id", "id_kendaraan");
	relation(OrmCustomerPO, OrmKanban, "id", "id_po");
	relation(OrmCustomerPOItem, OrmPOItemSppbIn, "id", "id_item");
	relation(OrmPOItemSppbIn, OrmKanbanItem, "id", "id_item");
	relation(OrmDocument, OrmKanban, "id", "doc_id");
	relation(OrmUser, OrmKanban, "id", [
		["createdBy", OrmKanban._aliasCreatedBy],
		["updatedBy", OrmKanban._aliasUpdatedBy],
	]);
	// relation(OrmCustomerPOItem, OrmPOItemSppbIn, "id", "kategori_mesin");

	relation(OrmSupplier, OrmSupplierItem, "id", "id_supplier");
	relation(OrmSupplier, OrmSupplierPO, "id", "id_supplier");
}

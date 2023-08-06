// @ts-nocheck

import {Model, ModelStatic} from "sequelize";

import {TSupItemRelation} from "@appTypes/app.type";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBOut,
	OrmDocument,
	OrmHardness,
	OrmHardnessKategori,
	OrmKanban,
	OrmKanbanItem,
	OrmKategoriMesin,
	OrmKendaraan,
	OrmMasterItem,
	OrmMaterial,
	OrmMaterialKategori,
	OrmMesin,
	OrmParameter,
	OrmParameterKategori,
	OrmPOItemSppbIn,
	OrmSupItemRelation,
	OrmSupplier,
	OrmSupplierItem,
	OrmSupplierPO,
	OrmSupplierPOItem,
	OrmUser,
} from "@database";

function oneToMany<M extends object, B extends object>(
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
	} else belongsTo(sourceForeignKey as string, alias);
}

export function initRelations() {
	oneToMany(OrmMasterItem, OrmCustomerPOItem, "id", "master_item_id");
	oneToMany(OrmMasterItem, OrmKanbanItem, "id", "master_item_id");
	oneToMany(OrmKategoriMesin, OrmMasterItem, "id", "kategori_mesin");
	oneToMany(
		OrmKategoriMesin,
		OrmMesin,
		"id",
		"kategori_mesin",
		OrmKategoriMesin._alias,
	);
	oneToMany(OrmCustomer, OrmCustomerPO, "id", "id_customer");
	oneToMany(OrmCustomer, OrmCustomerSPPBOut, "id", "id_customer");
	oneToMany(OrmKendaraan, OrmCustomerSPPBOut, "id", "id_kendaraan");
	oneToMany(OrmCustomerPO, OrmKanban, "id", "id_po");
	oneToMany(OrmCustomerPOItem, OrmPOItemSppbIn, "id", "id_item");
	oneToMany(OrmPOItemSppbIn, OrmKanbanItem, "id", "id_item");
	oneToMany(OrmDocument, OrmKanban, "id", "doc_id");
	oneToMany(OrmUser, OrmKanban, "id", [
		["createdBy", OrmKanban._aliasCreatedBy],
		["updatedBy", OrmKanban._aliasUpdatedBy],
	]);
	// relation(OrmCustomerPOItem, OrmPOItemSppbIn, "id", "kategori_mesin");

	// oneToMany(OrmSupplier, OrmSupplierItem, "id", "id_supplier");
	oneToMany(OrmSupplierPO, OrmSupplierPOItem, "id_po", "id");
	oneToMany(OrmSupItemRelation, OrmSupplierPOItem, "id_supplier_item", "id");

	// OrmSupplierPO.hasMany(OrmSupplierPOItem, {foreignKey: "id_po"});
	// OrmSupplierPOItem.belongsTo(OrmSupplierPO, {foreignKey: "id"});

	oneToMany(OrmHardnessKategori, OrmHardness, "id", "id_kategori");
	oneToMany(OrmMaterialKategori, OrmMaterial, "id", "id_kategori");
	oneToMany(OrmParameterKategori, OrmParameter, "id", "id_kategori");

	OrmSupplier.belongsToMany(OrmSupplierItem, {
		through: OrmSupItemRelation,
		as: OrmSupplierItem._alias,
		foreignKey: "supplier_id" as keyof TSupItemRelation,
	});
	OrmSupplierItem.belongsToMany(OrmSupplier, {
		through: OrmSupItemRelation,
		as: OrmSupplier._alias,
		foreignKey: "item_id" as keyof TSupItemRelation,
	});
}

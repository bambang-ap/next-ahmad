import {
	manyToMany,
	oneToMany,
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

export function initRelations() {
	oneToMany(OrmMasterItem, OrmCustomerPOItem, "master_item_id");
	oneToMany(OrmMasterItem, OrmKanbanItem, "master_item_id");
	oneToMany(OrmKategoriMesin, OrmMasterItem, "kategori_mesin");
	oneToMany(
		OrmKategoriMesin,
		OrmMesin,
		"kategori_mesin",
		OrmKategoriMesin._alias,
	);
	oneToMany(OrmCustomer, OrmCustomerPO, "id_customer");
	oneToMany(OrmCustomer, OrmCustomerSPPBOut, "id_customer");
	oneToMany(OrmKendaraan, OrmCustomerSPPBOut, "id_kendaraan");
	oneToMany(OrmCustomerPO, OrmKanban, "id_po");
	oneToMany(OrmCustomerPOItem, OrmPOItemSppbIn, "id_item");
	oneToMany(OrmPOItemSppbIn, OrmKanbanItem, "id_item");
	oneToMany(OrmDocument, OrmKanban, "doc_id");

	oneToMany(OrmUser, OrmKanban, "createdBy", OrmKanban._aliasCreatedBy);
	oneToMany(OrmUser, OrmKanban, "updatedBy", OrmKanban._aliasUpdatedBy);

	oneToMany(OrmSupplierPO, OrmSupplierPOItem, "id_po");
	oneToMany(OrmSupItemRelation, OrmSupplierPOItem, "id_supplier_item");

	oneToMany(OrmHardnessKategori, OrmHardness, "id_kategori");
	oneToMany(OrmMaterialKategori, OrmMaterial, "id_kategori");
	oneToMany(OrmParameterKategori, OrmParameter, "id_kategori");

	manyToMany(
		[OrmSupplier, "id"],
		[OrmSupplierItem, "id"],
		[OrmSupItemRelation, ["supplier_id", "item_id"]],
	);
}

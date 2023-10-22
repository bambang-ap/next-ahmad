import {
	dCust,
	dDoc,
	dInItem,
	dItem,
	dKanban,
	dKatMesin,
	dKnbItem,
	dMesin,
	dOutItem,
	dPo,
	dPoItem,
	dRejItem,
	dScan,
	dScanItem,
	dSItem,
	dSJIn,
	dSjOut,
	dSPo,
	dSPoItem,
	dSppbBridge,
	dSSUp,
	dUser,
	dVehicle,
	manyToMany,
	oneToMany,
	oneToOne,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmCustomerSPPBOutItem,
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
	OrmScan,
	OrmSupItemRelation,
	OrmSupplier,
	OrmSupplierItem,
	OrmSupplierPO,
	OrmSupplierPOItem,
	OrmUser,
} from '@database';

export function initRelations() {
	oneToMany(OrmMasterItem, OrmCustomerPOItem, 'master_item_id');
	oneToMany(OrmMasterItem, OrmKanbanItem, 'master_item_id');
	oneToMany(OrmMasterItem, OrmPOItemSppbIn, 'master_item_id');

	oneToMany(OrmCustomer, OrmCustomerPO, 'id_customer');
	oneToMany(OrmCustomer, OrmCustomerSPPBOut, 'id_customer');
	oneToMany(OrmCustomerSPPBOut, OrmCustomerSPPBOutItem, 'id_sppb_out');
	oneToMany(OrmKendaraan, OrmCustomerSPPBOut, 'id_kendaraan');
	oneToMany(OrmCustomerPO, OrmKanban, 'id_po');
	oneToMany(OrmCustomerPO, OrmCustomerPOItem, 'id_po');
	oneToMany(OrmCustomerPOItem, OrmPOItemSppbIn, 'id_item');
	oneToMany(OrmPOItemSppbIn, OrmKanbanItem, 'id_item');
	oneToMany(OrmPOItemSppbIn, OrmCustomerSPPBOutItem, 'id_item');
	oneToMany(OrmDocument, OrmKanban, 'doc_id');
	oneToMany(OrmKanban, OrmScan, 'id_kanban');
	oneToMany(OrmKanban, OrmKanbanItem, 'id_kanban');

	oneToMany(OrmCustomerSPPBIn, OrmPOItemSppbIn, 'id_sppb_in');
	oneToMany(OrmCustomerSPPBIn, OrmKanban, 'id_sppb_in');
	oneToMany(OrmCustomerPO, OrmCustomerSPPBIn, 'id_po');

	oneToMany(OrmUser, OrmKanban, 'createdBy', OrmKanban._aliasCreatedBy);
	oneToMany(OrmUser, OrmKanban, 'updatedBy', OrmKanban._aliasUpdatedBy);

	oneToMany(OrmKanban, dScan, 'id_kanban');
	oneToMany(dScan, dScanItem, 'id_scan');
	oneToMany(dScanItem, OrmKanbanItem, 'id_item');
	oneToMany(OrmCustomerPO, dScan, 'id_po');
	oneToMany(dScanItem, dRejItem, 'id_item');

	// UnMap Models
	oneToMany(OrmKategoriMesin, dItem, 'kategori_mesin');
	oneToMany(
		OrmKategoriMesin,
		OrmMesin,
		'kategori_mesin',
		OrmKategoriMesin._alias,
	);
	oneToMany(OrmSupplierPO, OrmSupplierPOItem, 'id_po');
	oneToMany(OrmSupItemRelation, OrmSupplierPOItem, 'id_supplier_item');
	oneToMany(OrmHardnessKategori, OrmHardness, 'id_kategori');
	oneToMany(OrmMaterialKategori, OrmMaterial, 'id_kategori');
	oneToMany(OrmParameterKategori, OrmParameter, 'id_kategori');
	manyToMany(
		[OrmSupplier, 'id'],
		[OrmSupplierItem, 'id'],
		[OrmSupItemRelation, ['supplier_id', 'item_id']],
	);

	// New Models
	oneToMany(dPo, dSJIn, 'id_po');
	oneToMany(dPo, dKanban, 'id_po');
	oneToMany(dPo, dPoItem, 'id_po');
	oneToMany(dSJIn, dKanban, 'id_sppb_in');
	oneToMany(dKanban, dKnbItem, 'id_kanban');
	oneToMany(dKnbItem, dScanItem, 'id_kanban_item');
	oneToMany(dKanban, dScan, 'id_kanban');
	oneToMany(dSJIn, dInItem, 'id_sppb_in');
	oneToMany(dInItem, dOutItem, 'id_item');
	oneToMany(dInItem, dKnbItem, 'id_item');
	oneToMany(dItem, dInItem, 'master_item_id');
	oneToMany(dItem, dKnbItem, 'master_item_id');
	oneToMany(dItem, dPoItem, 'master_item_id');
	oneToMany(dPoItem, dInItem, 'id_item');

	oneToMany(dCust, dSjOut, 'id_customer');
	oneToMany(dSjOut, dOutItem, 'id_sppb_out');
	oneToMany(dVehicle, dSjOut, 'id_kendaraan');
	oneToMany(dDoc, dKanban, 'doc_id');

	oneToMany(dUser, dKanban, 'createdBy', dKanban._aliasCreatedBy);
	oneToMany(dUser, dKanban, 'updatedBy', dKanban._aliasUpdatedBy);
	oneToMany(dCust, dPo, 'id_customer');

	oneToMany(dKatMesin, dItem, 'kategori_mesin');
	oneToMany(dKatMesin, dMesin, 'kategori_mesin');
	oneToMany(dMesin, dKnbItem, 'id_mesin');

	oneToMany(dSSUp, dSItem, 'sup_id');
	oneToMany(dSSUp, dSPo, 'sup_id');
	oneToMany(dSPo, dSPoItem, 'id_po');
	oneToMany(dSItem, dSPoItem, 'id_item');

	oneToOne(dScan, dScan, 'id_qc', dScan._aliasReject);

	manyToMany([dSJIn, 'id'], [dSjOut, 'id'], [dSppbBridge, ['in_id', 'out_id']]);
}

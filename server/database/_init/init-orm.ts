import {Sequelize} from "sequelize";

import {initdRejItem, initdScan, initdScanItem} from "@database";

import initOrmCustomer from "../models/customer";
import initOrmCustomerPO, {initDPo} from "../models/customer_po";
import initOrmCustomerPOItem, {initPoItem} from "../models/customer_po_item";
import initOrmCustomerSPPBIn, {initDSJIn} from "../models/customer_sppb_in";
import initOrmCustomerSPPBOut from "../models/customer_sppb_out";
import initOrmCustomerSPPBOutItem, {
	initOutItem,
} from "../models/customer_sppb_out_item";
import initOrmDocument from "../models/document";
import initOrmHardness from "../models/hardness";
import initOrmHardnessKategori from "../models/hardness_kategori";
import initOrmMasterItem, {initDItem} from "../models/item";
import initOrmKanban, {initDKanban} from "../models/kanban";
import initOrmKanbanInstruksi from "../models/kanban_instruksi";
import initOrmKanbanItem, {initDKanbanItem} from "../models/kanban_item";
import initOrmKendaraan from "../models/kendaraan";
import initOrmMaterial from "../models/material";
import initOrmMaterialKategori from "../models/material_kategori";
import initOrmMenu from "../models/menu";
import initOrmMesin from "../models/mesin";
import initOrmKategoriMesin from "../models/mesin_kategori";
import initOrmParameter from "../models/parameter";
import initOrmParameterKategori from "../models/parameter_kategori";
import initOrmPOItemSppbIn, {initInItem} from "../models/po_item_sppb_in";
import initOrmRole from "../models/role";
import initOrmScan from "../models/scan";
import initOrmSupplier from "../models/supplier";
import initOrmSupplierItem from "../models/supplier_item";
import initOrmSupItemRelation from "../models/supplier_item_relation";
import initOrmSupplierPO from "../models/supplier_po";
import initOrmSupplierPOItem from "../models/supplier_po_item";
import initOrmUser from "../models/user";
import initOrmCustomerLogin from "../models/user_login";

export function initOrm(ORM: Sequelize) {
	initOrmCustomer(ORM);
	initOrmCustomerLogin(ORM);
	initOrmMenu(ORM);
	initOrmCustomerPO(ORM);
	initOrmCustomerPOItem(ORM);
	initOrmCustomerSPPBIn(ORM);
	initOrmCustomerSPPBOut(ORM);
	initOrmKanbanInstruksi(ORM);
	initOrmKanban(ORM);
	initOrmMesin(ORM);
	initOrmKategoriMesin(ORM);
	initOrmRole(ORM);
	initOrmScan(ORM);
	initOrmUser(ORM);
	initOrmPOItemSppbIn(ORM);
	initOrmKanbanItem(ORM);
	initOrmMaterial(ORM);
	initOrmMaterialKategori(ORM);
	initOrmHardness(ORM);
	initOrmHardnessKategori(ORM);
	initOrmParameter(ORM);
	initOrmParameterKategori(ORM);
	initOrmKendaraan(ORM);
	initOrmDocument(ORM);
	initOrmMasterItem(ORM);
	initOrmSupplier(ORM);
	initOrmSupplierItem(ORM);
	initOrmSupplierPO(ORM);
	initOrmSupplierPOItem(ORM);
	initOrmSupItemRelation(ORM);
	initOrmCustomerSPPBOutItem(ORM);

	initdScan(ORM);
	initdScanItem(ORM);
	initdRejItem(ORM);

	initDPo(ORM);
	initDKanban(ORM);
	initDKanbanItem(ORM);
	initDSJIn(ORM);
	initDItem(ORM);
	initInItem(ORM);
	initOutItem(ORM);
	initPoItem(ORM);

	return Promise.resolve();
}

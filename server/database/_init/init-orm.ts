import {Sequelize} from "sequelize";

import initOrmCustomer from "../models/customer";
import initOrmCustomerPO from "../models/customer_po";
import initOrmCustomerPOItem from "../models/customer_po_item";
import initOrmCustomerSPPBIn from "../models/customer_sppb_in";
import initOrmCustomerSPPBOut from "../models/customer_sppb_out";
import initOrmDocument from "../models/document";
import initOrmHardness from "../models/hardness";
import initOrmHardnessKategori from "../models/hardness_kategori";
import initOrmMasterItem from "../models/item";
import initOrmKanban from "../models/kanban";
import initOrmKanbanInstruksi from "../models/kanban_instruksi";
import initOrmKanbanItem from "../models/kanban_item";
import initOrmKendaraan from "../models/kendaraan";
import initOrmMaterial from "../models/material";
import initOrmMaterialKategori from "../models/material_kategori";
import initOrmMenu from "../models/menu";
import initOrmMesin from "../models/mesin";
import initOrmKategoriMesin from "../models/mesin_kategori";
import initOrmParameter from "../models/parameter";
import initOrmParameterKategori from "../models/parameter_kategori";
import initOrmPOItemSppbIn from "../models/po_item_sppb_in";
import initOrmRole from "../models/role";
import initOrmScan from "../models/scan";
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

	return Promise.resolve();
}
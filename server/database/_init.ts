import {ModelDefined, Optional, Sequelize} from 'sequelize';

import initOrmCustomer from './models/customer';
import initOrmCustomerPO from './models/customer_po';
import initOrmCustomerPOItem from './models/customer_po_item';
import initOrmCustomerSPPBIn from './models/customer_sppb_in';
import initOrmCustomerSPPBOut from './models/customer_sppb_out';
import initOrmHardness from './models/hardness';
import initOrmHardnessKategori from './models/hardness_kategori';
import initOrmKanban from './models/kanban';
import initOrmKanbanInstruksi from './models/kanban_instruksi';
import initOrmKanbanItem from './models/kanban_item';
import initOrmMaterial from './models/material';
import initOrmMaterialKategori from './models/material_kategori';
import initOrmMenu from './models/menu';
import initOrmMesin from './models/mesin';
import initOrmParameter from './models/parameter';
import initOrmParameterKategori from './models/parameter_kategori';
import initOrmPOItemSppbIn from './models/po_item_sppb_in';
import initOrmRole from './models/role';
import initOrmScan from './models/scan';
import initOrmUser from './models/user';
import initOrmCustomerLogin from './models/user_login';

export type DefinedModel<
	T extends {},
	K extends keyof T = never,
> = ModelDefined<T, Optional<T, K>>;

const {
	NODE_ENV,
	PROD_PGSQL_USER,
	PROD_PGSQL_PASSWORD,
	PROD_PGSQL_HOST,
	DEV_PGSQL_USER,
	DEV_PGSQL_PASSWORD,
	DEV_PGSQL_HOST,
	PROD_PGSQL_PORT,
	DEV_PGSQL_PORT,
} = process.env;

const isProd = NODE_ENV === 'production';

export const ORM = new Sequelize(
	'manajemen',
	isProd ? PROD_PGSQL_USER : DEV_PGSQL_USER,
	isProd ? PROD_PGSQL_PASSWORD : DEV_PGSQL_PASSWORD,
	{
		dialect: 'postgres',
		port: isProd ? PROD_PGSQL_PORT : DEV_PGSQL_PORT,
		host: isProd ? PROD_PGSQL_HOST : DEV_PGSQL_HOST,
		// query: {raw: true},
		logging: false,
	},
);

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

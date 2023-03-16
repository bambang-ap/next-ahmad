import {ModelDefined, Optional, Sequelize} from 'sequelize';

import initOrmCustomer from './models/customer';
import initOrmCustomerPO from './models/customer_po';
import initOrmCustomerPOItem from './models/customer_po_item';
import initOrmCustomerSPPBIn from './models/customer_sppb_in';
import initOrmCustomerSPPBOut from './models/customer_sppb_out';
import initOrmKanban from './models/kanban';
import initOrmKanbanInstruksi from './models/kanban_instruksi';
import initOrmKanbanItem from './models/kanban_item';
import initOrmMenu from './models/menu';
import initOrmMesin from './models/mesin';
import initOrmPOItemSppbIn from './models/po_item_sppb_in';
import initOrmRole from './models/role';
import initOrmScan from './models/scan';
import initOrmUser from './models/user';

export type DefinedModel<
	T extends {},
	K extends keyof T = never,
> = ModelDefined<T, Optional<T, K>>;

export const ORM = new Sequelize(
	'manajemen',
	process.env.PGSQL_USER,
	process.env.PGSQL_PASSWORD,
	{
		dialect: 'postgres',
		port: process.env.PGSQL_PORT,
		host: process.env.PGSQL_HOST,
		// query: {raw: true},
	},
);

initOrmCustomer(ORM);
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

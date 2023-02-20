import {z} from 'zod';

export enum TABLES {
	CUSTOMER = 'customer',
	CUSTOMER_PO = 'customer_po',
	CUSTOMER_PO_ITEM = 'customer_po_item',
	CUSTOMER_SPPB_IN = 'customer_sppb_in',
	CUSTOMER_SPPB_OUT = 'customer_sppb_out',
	MENU = 'menu',
	MESIN = 'mesin',
	ROLE = 'role',
	USER = 'user',
}

export const Z_TABLES = z.nativeEnum(TABLES);

export enum CRUD_ENABLED {
	CUSTOMER = 'customer',
	MESIN = 'mesin',
	ROLE = 'role',
	USER = 'user',
	INSTRUKSI_KANBAN = 'instruksi_kanban',
	CUSTOMER_SPPB_IN = 'customer_sppb_in',
	CUSTOMER_SPPB_OUT = 'customer_sppb_out',
}

export const Z_CRUD_ENABLED = z.nativeEnum(CRUD_ENABLED);

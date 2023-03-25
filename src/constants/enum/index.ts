import {z} from 'zod';

export enum TABLES {
	CUSTOMER = 'customer',
	USER_LOGIN = 'user_login',
	CUSTOMER_PO = 'po',
	CUSTOMER_PO_ITEM = 'po_itemm',
	CUSTOMER_SPPB_IN = 'customer_sppb_in',
	CUSTOMER_SPPB_OUT = 'customer_sppb_out',
	MENU = 'menu',
	MESIN = 'mesin',
	ROLE = 'role',
	USER = 'user',
	KANBAN = 'kanban',
	INSTRUKSI_KANBAN = 'instruksi_kanban',
	SCAN = 'scan',
	PO_ITEM_SPPB_IN = 'po_item_sppb_in',
	KANBAN_ITEM = 'kanban_item',
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
	SCAN = 'scan',
}

export const Z_CRUD_ENABLED = z.nativeEnum(CRUD_ENABLED);

export const OpKeys = [
	'eq',
	'ne',
	'gte',
	'gt',
	'lte',
	'lt',
	'not',
	'is',
	'in',
	'notIn',
	'like',
	'notLike',
	'iLike',
	'notILike',
	'startsWith',
	'endsWith',
	'substring',
	'regexp',
	'notRegexp',
	'iRegexp',
	'notIRegexp',
	'between',
	'notBetween',
	'overlap',
	'contains',
	'contained',
	'adjacent',
	'strictLeft',
	'strictRight',
	'noExtendRight',
	'noExtendLeft',
	'and',
	'or',
	'any',
	'all',
	'values',
	'col',
	'placeholder',
	'join',
	'match',
] as const;

export const Op = OpKeys.reduce<EOp>((ret, key) => {
	return {...ret, [key]: Symbol.for(key)};
}, {});

export const eOpKeys = z.enum(OpKeys);

export type EOp = z.infer<typeof eOp>;
export const eOp = z.record(eOpKeys, z.symbol());

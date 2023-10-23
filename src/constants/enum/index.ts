import {z} from 'zod';

import {classNames, twColors} from '@utils';

export enum CATEGORY_REJECT {
	A = 'Test Piece',
	B = 'Re-Proses',
	C = 'Scrap',
}

export enum CATEGORY_REJECT_DB {
	A = 'A',
	B = 'B',
	C = 'C',
}

export enum PO_STATUS {
	A = 'PO',
	B = 'SPPB In',
	C = 'Kanban',
	D = 'Produksi',
	E = 'QC',
	F = 'Finish Good',
	G = 'SPPB Out',
	H = 'Unknown',
}

export enum REJECT_REASON {
	TP = 'TP',
	RP = 'RP',
	SC = 'SC',
}

export enum REJECT_REASON_VIEW {
	TP = 'Test Piece',
	RP = 'Re-Process',
	SC = 'Scrap',
}

export enum INTERNAL_TABLES {
	ITEM = 'internal_item',
	SUPPLIER = 'internal_supplier',
	PO = 'internal_po',
	PO_ITEM = 'internal_po_item',
	SJ_IN = 'internal_sj_in',
	SJ_IN_ITEM = 'internal_sj_in_item',
}

export enum TABLES {
	SUPPLIER = 'inv_supplier',
	SUPPLIER_ITEM = 'inv_supplier_item',
	SUPPLIER_ITEM_RELATION = 'inv_supplier_item_relation',
	SUPPLIER_PO = 'inv_supplier_po',
	SUPPLIER_PO_ITEM = 'inv_supplier_po_item',
	CUSTOMER = 'customer',
	CUSTOMER_PO = 'po',
	CUSTOMER_PO_ITEM = 'po_itemm',
	CUSTOMER_SPPB_IN = 'customer_sppb_in',
	CUSTOMER_SPPB_OUT = 'customer_sppb_out',
	CUSTOMER_SPPB_RELATION = 'customer_sppb_relation',
	CUSTOMER_SPPB_OUT_ITEM = 'customer_sppb_out_item',
	DOCUMENT = 'document_number',
	HARDNESS = 'hardness',
	HARDNESS_KATEGORI = 'hardness_kategori',
	INSTRUKSI_KANBAN = 'instruksi_kanban',
	KANBAN = 'kanban',
	KANBAN_ITEM = 'kanban_item',
	KENDARAAN = 'kendaraan',
	MATERIAL = 'material',
	MATERIAL_KATEGORI = 'material_kategori',
	MENU = 'menu',
	MESIN = 'mesin',
	MESIN_KATEGORI = 'mesin_kategori',
	PARAMETER = 'parameter',
	PARAMETER_KATEGORI = 'parameter_kategori',
	PO_ITEM_SPPB_IN = 'po_item_sppb_in',
	ROLE = 'role',
	SCAN = 'scan',
	USER = 'user_pengguna',
	USER_LOGIN = 'user_login',
	ITEM = 'master_item',
	NEW_SCAN = 'scan_new',
	NEW_SCAN_ITEM = 'scan_new_item',
	NEW_SCAN_ITEM_REJECT = 'scan_new_item_reject',
}

export enum CRUD_ENABLED {
	CUSTOMER = 'customer',
	MESIN = 'mesin',
	MESIN_KATEGORI = 'mesin_kategori',
	KENDARAAN = 'kendaraan',
	ROLE = 'role',
	USER = 'user_pengguna',
	INSTRUKSI_KANBAN = 'instruksi_kanban',
	CUSTOMER_SPPB_IN = 'customer_sppb_in',
	CUSTOMER_SPPB_OUT = 'customer_sppb_out',
	SCAN = 'scan',
	MATERIAL = 'material',
	MATERIAL_KATEGORI = 'material_kategori',
	HARDNESS = 'hardness',
	HARDNESS_KATEGORI = 'hardness_kategori',
	PARAMETER = 'parameter',
	PARAMETER_KATEGORI = 'parameter_kategori',
	DOCUMENT = 'document_number',
	ITEM = 'master_item',
}

export const MenuColorClass = {
	PO: classNames('bg-emerald-500'),
	SJIn: classNames('bg-amber-500'),
	Kanban: classNames('bg-cyan-500'),
	Prod: classNames('bg-blue-500'),
	QC: classNames('bg-fuchsia-500'),
	FG: classNames('bg-lime-500'),
	SJOut: classNames('bg-rose-500'),
	[REJECT_REASON.TP]: classNames('bg-indigo-500'),
	[REJECT_REASON.RP]: classNames('bg-teal-500'),
	[REJECT_REASON.SC]: classNames('bg-yellow-500'),
	OtPO: classNames('bg-violet-500'),
	OtProd: classNames('bg-sky-500'),

	Mesin: classNames('bg-stone-500'),
	Vehicle: classNames('bg-amber-700'),
	Cust: classNames('bg-emerald-500'),
	Material: classNames('bg-teal-500'),
};

export const MenuColor = Object.entries(MenuColorClass).reduce(
	(ret, [a, b]) => {
		type J = typeof twColors;
		type K = keyof J;
		type O = keyof J['cyan'];
		const [aa, bb] = b.replace(/bg-/, '').split('-') as [K, O];
		return {...ret, [a]: twColors[aa][bb]};
	},
	{} as typeof MenuColorClass,
);

export const Z_TABLES = z.nativeEnum(TABLES);
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

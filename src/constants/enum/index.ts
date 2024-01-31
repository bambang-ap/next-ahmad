import {z} from 'zod';

import {classNames, twColors} from '@utils';

export enum USER_ROLE {
	ADMIN = '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729',
	SUPER_ADMIN = 'R230823da93',
}

export enum PATHS {
	dev_scan_remove = '/app/scanRemove',

	signin = '/auth/signin',
	app = '/app',
	app_dashboard = '/app/dashboard',
	app_dashboard_transaksi = '/app/dashboard/transaksi',
	app_customer = '/app/customer',
	app_customer_customer_sppb_in = '/app/customer/customer_sppb_in',
	app_customer_customer_sppb_out = '/app/customer/customer_sppb_out',
	app_customer_po = '/app/customer/po',
	app_document = '/app/document',
	app_gallery = '/app/gallery',
	app_hardness = '/app/hardness',
	app_hardness_kategori = '/app/hardness/kategori',
	app_index_number = '/app/index-number',
	app_internal = '/app/internal',
	app_internal_item = '/app/internal/item',
	app_internal_out_barang = '/app/internal/out-barang',
	app_internal_po = '/app/internal/po',
	app_internal_request = '/app/internal/request',
	app_internal_sj_masuk = '/app/internal/sj_masuk',
	app_internal_stock = '/app/internal/stock',
	app_internal_supplier = '/app/internal/supplier',
	app_item = '/app/item',
	app_kanban = '/app/kanban',
	app_kanban_instruksi = '/app/kanban/instruksi',
	app_kanban_reject = '/app/kanban/reject',
	app_kendaraan = '/app/kendaraan',
	app_material = '/app/material',
	app_material_kategori = '/app/material/kategori',
	app_menu = '/app/menu',
	app_mesin = '/app/mesin',
	app_mesin_kategori = '/app/mesin/kategori',
	app_parameter = '/app/parameter',
	app_parameter_kategori = '/app/parameter/kategori',
	app_scan_finish_good = '/app/scan/finish_good',
	app_scan_finish_good_list = '/app/scan/finish_good/list',
	app_scan_out_barang = '/app/scan/out_barang',
	app_scan_produksi = '/app/scan/produksi',
	app_scan_produksi_list = '/app/scan/produksi/list',
	app_scan_qc = '/app/scan/qc',
	app_scan_qc_list = '/app/scan/qc/list',
	app_scan_remove = '/app/scanRemove',
	app_user = '/app/user',
	app_user_role = '/app/user/role',
	Hardness = '',
	Inventory = '',
	Inventory_Internal = '',
	Master_User = '',
	Material = '',
	Menu_Master_Stock_Produksi = '',
	Mesin = '',
	Parameter = '',
}

export enum REQ_FORM_STATUS {
	req = 'request',
	proc = 'process',
	close = 'close',
}

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

export enum KANBAN_STATUS {
	'Open',
	'Produksi',
	'QC',
	'Finish Good',
	'Surat Jalan Keluar',
}

export enum INTERNAL_PO_STATUS {
	A = 'Open',
	B = 'Partial',
	C = 'Closed',
	D = 'Overdue',
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
	REQUEST = 'internal_request',
	STOCK = 'internal_stock',
	OUT = 'internal_out_barang',
}

export enum DiscType {
	Percentage = '%',
	Value = '1',
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
	INDEX_NUMBER = 'index_number',
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

export enum PO_SCORE_STATUS {
	UN_PROC = 'UnProcess',
	IN = 'OnSJIn',
	OUT = 'OnSJOut',
	NONE = 'None',
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
	OtSjOut: classNames('bg-orange-500'),

	Mesin: classNames('bg-stone-500'),
	Vehicle: classNames('bg-amber-700'),
	Cust: classNames('bg-emerald-500'),
	Material: classNames('bg-teal-500'),
};

export const MenuName: Record<keyof typeof MenuColorClass, string> = {
	PO: 'PO',
	SJIn: 'SJ Masuk',
	Kanban: 'Kanban',
	Prod: 'Produksi',
	QC: 'QC',
	FG: 'Finish Good',
	SJOut: 'SJ Keluar',
	[REJECT_REASON.TP]: 'Reject Test Piece',
	[REJECT_REASON.RP]: 'Reject Re-Process',
	[REJECT_REASON.SC]: 'Reject Scrap',
	OtPO: 'Outstanding Po',
	OtProd: 'Outstanding Produksi',
	OtSjOut: 'Outstanding SJ Keluar',
	Mesin: 'Mesin',
	Vehicle: 'Kendaraan',
	Cust: 'Customer',
	Material: 'Material',
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

export enum IndexNumber {
	Kanban = 'Kanban',
	Req = 'Form Permintaan',
	InternalPO = 'PO Internal',
	OutSJ = 'SJ Keluar',
}

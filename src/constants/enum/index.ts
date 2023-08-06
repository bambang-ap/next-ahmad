import {z} from "zod";

export enum PO_STATUS {
	A = "PO",
	B = "SPPB In",
	C = "Kanban",
	D = "Produksi",
	E = "QC",
	F = "Finish Good",
	G = "SPPB Out",
}

export enum TABLES {
	SUPPLIER = "inv_supplier",
	SUPPLIER_ITEM = "inv_supplier_item",
	SUPPLIER_ITEM_RELATION = "inv_supplier_item_relation",
	SUPPLIER_PO = "inv_supplier_po",
	SUPPLIER_PO_ITEM = "inv_supplier_po_item",
	CUSTOMER = "customer",
	CUSTOMER_PO = "po",
	CUSTOMER_PO_ITEM = "po_itemm",
	CUSTOMER_SPPB_IN = "customer_sppb_in",
	CUSTOMER_SPPB_OUT = "customer_sppb_out",
	DOCUMENT = "document_number",
	HARDNESS = "hardness",
	HARDNESS_KATEGORI = "hardness_kategori",
	INSTRUKSI_KANBAN = "instruksi_kanban",
	KANBAN = "kanban",
	KANBAN_ITEM = "kanban_item",
	KENDARAAN = "kendaraan",
	MATERIAL = "material",
	MATERIAL_KATEGORI = "material_kategori",
	MENU = "menu",
	MESIN = "mesin",
	MESIN_KATEGORI = "mesin_kategori",
	PARAMETER = "parameter",
	PARAMETER_KATEGORI = "parameter_kategori",
	PO_ITEM_SPPB_IN = "po_item_sppb_in",
	ROLE = "role",
	SCAN = "scan",
	USER = "user_pengguna",
	USER_LOGIN = "user_login",
	ITEM = "master_item",
}

export enum CRUD_ENABLED {
	CUSTOMER = "customer",
	MESIN = "mesin",
	MESIN_KATEGORI = "mesin_kategori",
	KENDARAAN = "kendaraan",
	ROLE = "role",
	USER = "user_pengguna",
	INSTRUKSI_KANBAN = "instruksi_kanban",
	CUSTOMER_SPPB_IN = "customer_sppb_in",
	CUSTOMER_SPPB_OUT = "customer_sppb_out",
	SCAN = "scan",
	MATERIAL = "material",
	MATERIAL_KATEGORI = "material_kategori",
	HARDNESS = "hardness",
	HARDNESS_KATEGORI = "hardness_kategori",
	PARAMETER = "parameter",
	PARAMETER_KATEGORI = "parameter_kategori",
	DOCUMENT = "document_number",
	ITEM = "master_item",
}

export const Z_TABLES = z.nativeEnum(TABLES);
export const Z_CRUD_ENABLED = z.nativeEnum(CRUD_ENABLED);

export const OpKeys = [
	"eq",
	"ne",
	"gte",
	"gt",
	"lte",
	"lt",
	"not",
	"is",
	"in",
	"notIn",
	"like",
	"notLike",
	"iLike",
	"notILike",
	"startsWith",
	"endsWith",
	"substring",
	"regexp",
	"notRegexp",
	"iRegexp",
	"notIRegexp",
	"between",
	"notBetween",
	"overlap",
	"contains",
	"contained",
	"adjacent",
	"strictLeft",
	"strictRight",
	"noExtendRight",
	"noExtendLeft",
	"and",
	"or",
	"any",
	"all",
	"values",
	"col",
	"placeholder",
	"join",
	"match",
] as const;

export const Op = OpKeys.reduce<EOp>((ret, key) => {
	return {...ret, [key]: Symbol.for(key)};
}, {});

export const eOpKeys = z.enum(OpKeys);

export type EOp = z.infer<typeof eOp>;
export const eOp = z.record(eOpKeys, z.symbol());

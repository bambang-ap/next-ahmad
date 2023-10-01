import {Route, TScanTarget} from "@appTypes/app.type";
import {
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tCustomerSPPBOut,
	tCustomerSPPBOutItem,
	tDocument,
	tKanban,
	tKanbanItem,
	tKendaraan,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
	TScan,
	tScan,
	tUser,
} from "@appTypes/app.zod";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScanNew,
	OrmScanNewItem,
	OrmUser,
} from "@database";
import {PO_STATUS} from "@enum";

import {attrParser, attrParserV2, NumberOrderAttribute} from "./";

export function sppbInGetPage() {
	const A = attrParser(tCustomerSPPBIn, ["tgl", "id", "id_po", "nomor_surat"]);
	const B = attrParser(tCustomerPO, ["nomor_po"]);
	const C = attrParser(tCustomer, ["name", "id"]);
	const D = attrParser(tPOItemSppbIn);
	const E = attrParser(tPOItem);
	const F = attrParser(tMasterItem);

	type Ret = typeof A.obj & {
		OrmCustomerPO: typeof B.obj & {OrmCustomer: typeof C.obj};
		OrmPOItemSppbIns: (typeof D.obj & {
			OrmCustomerPOItem: typeof E.obj;
			OrmMasterItem: typeof F.obj;
		})[];
	};

	return {A, B, C, D, E, F, Ret: {} as Ret};
}

export function exportKanbanAttributes() {
	const A = attrParser(tKanban, ["nomor_kanban", "keterangan"]);
	const B = attrParser(tCustomerSPPBIn, ["nomor_surat"]);
	const C = attrParser(tPOItemSppbIn, ["id_item", "id"]);
	const D = attrParser(tCustomerPO, ["nomor_po"]);
	const E = attrParser(tCustomer, ["name"]);
	const F = attrParser(tPOItem, ["id", "unit1", "unit2", "unit3"]);
	const G = attrParser(tKanbanItem, ["id_item", "qty1", "qty2", "qty3"]);
	const H = attrParser(tMasterItem, [
		"kode_item",
		"name",
		"instruksi",
		"kategori_mesinn",
	]);

	type Ret = typeof A.obj & {
		OrmCustomerSPPBIn: typeof B.obj & {
			OrmPOItemSppbIns: typeof C.obj[];
		};
		OrmCustomerPO: typeof D.obj & {
			OrmCustomer: typeof E.obj;
			OrmCustomerPOItems: typeof F.obj[];
		};
		OrmKanbanItems: (typeof G.obj & {OrmMasterItem: typeof H.obj})[];
	};

	type Output = Record<
		| "CUSTOMER"
		| "NOMOR PO"
		| "NOMOR SJ"
		| "NOMOR KANBAN"
		| "PART NAME"
		| "PART NO"
		| "QTY / JUMLAH"
		| "PROSES"
		| "KETERANGAN",
		string
	>;

	return {A, B, C, D, E, F, G, H, Ret: {} as Ret, Output: {} as Output};
}
export function exportScanAttributes(route: Route["route"]) {
	type Output = Record<
		| "NO"
		| "TANGGAL PROSES"
		| "CUSTOMER"
		| "PART NAME"
		| "PART NO"
		| "QTY / JUMLAH"
		| "WAKTU / JAM PROSES"
		| "NO LOT CUSTOMER"
		| "NO LOT IMI"
		| "PROSES"
		| "NOMOR KANBAN"
		| "NOMOR MESIN"
		| "NAMA MESIN"
		| "KETERANGAN",
		string
	>;

	const A = attrParser(tScan, ["date", "lot_no_imi", `item_${route}`]);
	const B = attrParser(tKanban, ["nomor_kanban", "list_mesin", "keterangan"]);
	const C = attrParser(tCustomerSPPBIn, ["id"]);
	const D = attrParser(tPOItemSppbIn, ["id", "id_item", "lot_no"]);
	const E = attrParser(tCustomerPO, ["id"]);
	const F = attrParser(tCustomer, ["name"]);
	const G = attrParser(tPOItem, ["id", "unit1", "unit2", "unit3"]);
	const H = attrParser(tKanbanItem, ["id_item"]);
	const I = attrParser(tMasterItem, [
		"instruksi",
		"kategori_mesinn",
		"name",
		"kode_item",
	]);
	const J = attrParser(tPOItemSppbIn, ["id"]);

	type Ret = typeof A.obj & {
		OrmKanban: typeof B.obj & {
			OrmCustomerSPPBIn: typeof C.obj & {
				OrmPOItemSppbIns: typeof D.obj[];
			};
			OrmCustomerPO: typeof E.obj & {
				OrmCustomer: typeof F.obj;
				OrmCustomerPOItems: typeof G.obj[];
			};
			OrmKanbanItems: (typeof H.obj & {
				OrmMasterItem: typeof I.obj;
				OrmPOItemSppbIn: typeof J.obj;
			})[];
		};
	};

	return {A, B, C, D, E, F, G, H, I, J, Ret: {} as Ret, Output: {} as Output};
}

export function scanListAttributes() {
	const A = attrParser(tScan, ["id", "id_kanban", "date"]);
	const B = attrParser(tKanban, ["nomor_kanban", "createdAt", "keterangan"]);
	const C = attrParser(tCustomerSPPBIn, ["nomor_surat"]);
	const D = attrParser(tCustomerPO, ["nomor_po"]);
	const E = attrParser(tCustomer, ["name"]);

	const num = NumberOrderAttribute<TScan>('"OrmScan"."id"');

	type Ret = typeof A.obj & {
		number?: number;
		OrmKanban: typeof B.obj & {
			OrmCustomerPO: typeof D.obj & {OrmCustomer: typeof E.obj};
			OrmCustomerSPPBIn: typeof C.obj;
		};
	};

	return {A, B, C, D, E, num, Ret: {} as Ret};
}

export function printScanAttributes(route: TScanTarget) {
	const A = attrParser(tScan, [
		"id_kanban",
		"createdAt",
		"lot_no_imi",
		`item_${route}`,
	]);
	const B = attrParser(tKanban, ["id", "nomor_kanban"]);
	const C = attrParser(tCustomerPO, ["id"]);
	const D = attrParser(tCustomer, ["name"]);
	const E = attrParser(tKanbanItem, ["id"]);
	const F = attrParser(tMasterItem, ["instruksi", "name", "kode_item"]);
	const G = attrParser(tPOItemSppbIn, ["lot_no"]);
	const H = attrParser(tPOItem, ["unit1", "unit2", "unit3"]);
	const I = attrParser(tCustomerSPPBIn, ["nomor_surat"]);

	type Ret = typeof A.obj & {
		OrmKanban: typeof B.obj & {
			OrmCustomerPO: typeof C.obj & {OrmCustomer: typeof D.obj};
			OrmKanbanItems: (typeof E.obj & {
				OrmMasterItem: typeof F.obj;
				OrmPOItemSppbIn: typeof G.obj & {
					OrmCustomerPOItem: typeof H.obj;
					OrmCustomerSPPBIn: typeof I.obj;
				};
			})[];
		};
	};

	return {A, B, C, D, E, F, G, H, I, Ret: {} as Ret};
}

export function getScanAttributesV2() {
	const scn = attrParserV2(OrmScanNew);
	const knb = attrParserV2(OrmKanban, [
		"id",
		"list_mesin",
		"keterangan",
		"createdAt",
	]);
	const scItem = attrParserV2(OrmScanNewItem);
	const knbItem = attrParserV2(OrmKanbanItem, ["id", "qty1", "qty2", "qty3"]);
	const user = attrParserV2(OrmUser, ["name"]);
	const bin = attrParserV2(OrmCustomerSPPBIn, ["nomor_surat"]);
	const po = attrParserV2(OrmCustomerPO, ["nomor_po"]);
	const cust = attrParserV2(OrmCustomer, ["id", "name"]);
	const mItem = attrParserV2(OrmMasterItem, ["kode_item", "name", "id"]);
	const binItem = attrParserV2(OrmPOItemSppbIn, ["id"]);
	const poItem = attrParserV2(OrmCustomerPOItem, ["unit1", "unit2", "unit3"]);

	type Ret = Partial<typeof scn.obj> & {
		OrmScanNewItems?: typeof scItem.obj[];
		OrmKanban: typeof knb.obj & {
			[OrmKanban._aliasCreatedBy]: typeof user.obj;
			OrmCustomerSPPBIn: typeof bin.obj & {
				OrmCustomerPO: typeof po.obj & {OrmCustomer: typeof cust.obj};
			};
			OrmKanbanItems: (typeof knbItem.obj & {
				OrmMasterItem: typeof mItem.obj;
				OrmPOItemSppbIn: typeof binItem.obj & {
					OrmCustomerPOItem: typeof poItem.obj;
				};
			})[];
		};
	};

	// A: scn,
	// B: knb,
	// C: scItem,
	// D: knbItem,
	// E: user,
	return {
		scn,
		knb,
		scItem,
		knbItem,
		user,
		bin,
		po,
		cust,
		mItem,
		binItem,
		poItem,
		Ret: {} as Ret,
	};
}

export function getScanAttributes(route: TScanTarget) {
	const A = attrParser(tScan, [
		"lot_no_imi",
		"item_qc_reject",
		"item_qc_reject_category",
		"notes",
		"item_from_kanban",
		"id_customer",
		`item_${route}`,
		`status_${route}`,
	]);
	const B = attrParser(tKanban, [
		"id",
		"nomor_kanban",
		"keterangan",
		"list_mesin",
		"createdAt",
	]);
	const C = attrParser(tUser, ["name"]);
	const D = attrParser(tCustomerPO, ["nomor_po"]);
	const E = attrParser(tCustomer, ["name"]);
	const F = attrParser(tCustomerSPPBIn, ["nomor_surat"]);
	const G = attrParser(tKanbanItem, ["id_item", "id", "qty1", "qty2", "qty3"]);
	const H = attrParser(tPOItemSppbIn, ["id"]);
	const I = attrParser(tPOItem);
	const J = attrParser(tMasterItem, ["kode_item", "name"]);

	type Ret = typeof A.obj & {
		OrmKanban: typeof B.obj & {
			[OrmKanban._aliasCreatedBy]: typeof C.obj;
			OrmCustomerSPPBIn: typeof F.obj & {
				OrmCustomerPO: typeof D.obj & {OrmCustomer: typeof E.obj};
			};
			OrmKanbanItems: (typeof G.obj & {
				OrmMasterItem: typeof J.obj;
				OrmPOItemSppbIn: typeof H & {OrmCustomerPOItem: typeof I.obj};
			})[];
		};
	};

	return {A, B, C, D, E, F, G, H, I, J, Ret: {} as Ret};
}

export function poGetAttributes() {
	const A = attrParser(tCustomerPO);
	const B = attrParser(tCustomer, ["name"]);
	const C = attrParser(tPOItem);
	const D = attrParser(tMasterItem);

	type Ret = typeof A.obj & {
		status: PO_STATUS;
		OrmCustomer: typeof B.obj;
		OrmCustomerPOItems: (typeof C.obj & {OrmMasterItem: typeof D.obj})[];
	};

	return {A, B, C, D, Ret: {} as Ret};
}

export function sppbOutGetAttributes() {
	const A = attrParser(tCustomerSPPBOutItem, [
		"id",
		"id_item",
		"qty1",
		"qty2",
		"qty3",
	]);
	const B = attrParser(tCustomerSPPBOut);
	const C = attrParser(tPOItemSppbIn, [
		"id_item",
		"id_sppb_in",
		"master_item_id",
	]);
	const D = attrParser(tCustomerSPPBIn, ["id_po"]);
	const E = attrParser(tCustomer, ["name"]);
	const F = attrParser(tKendaraan, ["name"]);

	type Ret = typeof B.obj & {
		OrmCustomer: typeof E.obj;
		OrmKendaraan: typeof F.obj;
		OrmCustomerSPPBOutItems: (typeof A.obj & {
			OrmPOItemSppbIn: typeof C.obj & {
				OrmCustomerSPPBIn: typeof D.obj;
			};
		})[];
	};

	return {A, B, C, D, E, F, Ret: {} as Ret};
}

export function printSppbOutAttributes() {
	const A = attrParser(tCustomerSPPBOut, [
		"id",
		"id_customer",
		"date",
		"invoice_no",
		"keterangan",
	]);
	const B = attrParser(tKendaraan, ["name"]);
	const C = attrParser(tCustomer, ["name", "alamat"]);
	const D = attrParser(tCustomerSPPBOutItem, ["qty1", "qty2", "qty3"]);
	const E = attrParser(tPOItemSppbIn, ["lot_no"]);
	const F = attrParser(tMasterItem, [
		"instruksi",
		"kategori_mesinn",
		"name",
		"keterangan",
	]);
	const G = attrParser(tPOItem, ["unit1", "unit2", "unit3"]);
	const H = attrParser(tCustomerPO);
	const I = attrParser(tCustomerSPPBIn);
	const J = attrParser(tKanban, ["id"]);
	const K = attrParser(tScan, ["lot_no_imi"]);
	const L = attrParser(tDocument, [
		"doc_no",
		"tgl_efektif",
		"revisi",
		"terbit",
	]);

	type Ret = typeof A.obj & {
		OrmKendaraan: typeof B.obj;
		OrmCustomer: typeof C.obj;
		OrmCustomerSPPBOutItems: (typeof D.obj & {
			OrmPOItemSppbIn: typeof E.obj & {
				OrmCustomerSPPBIn: typeof I.obj & {
					OrmKanbans: (typeof J.obj & {
						OrmScans: typeof K.obj[];
						OrmDocument: typeof L.obj;
					})[];
				};
				OrmMasterItem: typeof F.obj;
				OrmCustomerPOItem: typeof G.obj & {OrmCustomerPO: typeof H.obj};
			};
		})[];
	};

	return {A, B, C, D, E, F, G, H, I, J, K, L, Ret: {} as Ret};
}

export function sppbOutGetPoAttributes() {
	const A = attrParser(tKanban, ["id"]);
	const B = attrParser(tCustomerSPPBIn);
	const C = attrParser(tCustomerPO);
	const D = attrParser(tScan, [
		"item_finish_good",
		"status_finish_good",
		"lot_no_imi",
	]);
	const E = attrParser(tPOItemSppbIn, ["id", "qty1", "qty2", "qty3", "lot_no"]);
	const F = attrParser(tCustomerSPPBOutItem, ["id", "qty1", "qty2", "qty3"]);
	const G = attrParser(tMasterItem, ["name", "kode_item", "id"]);
	const H = attrParser(tPOItem, ["id", "unit1", "unit2", "unit3"]);
	const I = attrParser(tKanbanItem, ["id", "qty1", "qty2", "qty3"]);

	type Ret = typeof C.obj & {
		OrmCustomerSPPBIns: (typeof B.obj & {
			OrmKanbans: (typeof A.obj & {
				OrmScans: typeof D.obj[];
			})[];
			OrmPOItemSppbIns: (typeof E.obj & {
				OrmCustomerPOItem: typeof H.obj;
				OrmMasterItem: typeof G.obj;
				OrmKanbanItems: typeof I.obj[];
				OrmCustomerSPPBOutItems: (typeof F.obj & {})[];
			})[];
		})[];
	};

	return {A, B, C, D, E, F, G, H, I, Ret: {} as Ret};
}

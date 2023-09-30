import {Route, TScanTarget} from "@appTypes/app.type";
import {
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tKanban,
	tKanbanItem,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
	TScan,
	tScan,
	tUser,
} from "@appTypes/app.zod";

import {OrmKanban} from "../models/kanban";
import {attrParser, NumberOrderAttribute} from "./";

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

	const num = NumberOrderAttribute<TScan>('"OrmScan"."id"');

	type Ret = typeof A.obj & {
		number?: number;
		OrmKanban: typeof B.obj;
	};

	return {A, B, num, Ret: {} as Ret};
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

export function getScanAttributes(route: TScanTarget) {
	const A = attrParser(tScan, [
		"lot_no_imi",
		"item_qc_reject",
		"item_qc_reject_category",
		"notes",
		"item_from_kanban",
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

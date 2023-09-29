import {
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tKanban,
	tKanbanItem,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
} from "@appTypes/app.zod";

import {attrParser} from "./";

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

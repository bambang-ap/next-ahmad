import {
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
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

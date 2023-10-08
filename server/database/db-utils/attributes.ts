import {Includeable} from "sequelize";

import {Route, TScanTarget} from "@appTypes/app.type";
import {
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tCustomerSPPBOut,
	tCustomerSPPBOutItem,
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
	attrParser,
	attrParserExclude,
	attrParserV2,
	dCust,
	dDoc,
	dInItem,
	dItem,
	dKanban,
	dKnbItem,
	dOutItem,
	dPo,
	dPoItem,
	dRejItem,
	dScan,
	dScanItem,
	dSJIn,
	dSjOut,
	dUser,
	dVehicle,
	NumberOrderAttribute,
	OrmKanban,
} from "@database";
import {PO_STATUS} from "@enum";

export function getPrintPoAttributes() {
	const Po = attrParserExclude(dPo, ["id", "id_customer"]);
	const PoItem = attrParserExclude(dPoItem, [
		"harga",
		"id",
		"id_po",
		"master_item_id",
	]);
	const InItem = attrParserV2(dInItem, ["qty1", "qty2", "qty3"]);
	const OutItem = attrParserV2(dOutItem, ["qty1", "qty2", "qty3"]);
	const KnbItem = attrParserV2(dKnbItem, ["id", "qty1", "qty2", "qty3"]);
	const ScanItem = attrParserV2(dScanItem, ["qty1", "qty2", "qty3"]);
	const Kanban = attrParserV2(dKanban, ["nomor_kanban"]);
	const Scan = attrParserV2(dScan, ["status"]);
	const SJIn = attrParserV2(dSJIn, ["nomor_surat"]);
	const Item = attrParserV2(dItem, ["name", "kode_item"]);
	const Cust = attrParserV2(dCust, ["name"]);

	const poIncludeAble: Includeable[] = [
		Cust,
		{
			...PoItem,
			include: [
				Item,
				{
					...InItem,
					include: [
						SJIn,
						OutItem,
						{
							...KnbItem,
							include: [Kanban],
						},
					],
				},
			],
		},
	];

	type RetScnItem = typeof ScanItem.obj & {
		dScan: typeof Scan.obj;
	};

	type Ret = typeof Po.obj & {
		dCust: typeof Cust.obj;
		dPoItems: typeof PoItem.obj & {
			dItem: typeof Item.obj;
			dInItems?: typeof InItem.obj & {
				dSJIn?: typeof SJIn.obj;
				dOutItems: typeof OutItem.obj & {};
				dKnbItems?: typeof KnbItem.obj & {
					dKanban: typeof Kanban.obj;
					dScanItems?: RetScnItem[];
				};
			};
		};
	};

	return {
		Po,
		PoItem,
		InItem,
		OutItem,
		KnbItem,
		ScanItem,
		Kanban,
		Scan,
		poIncludeAble,
		RetScnItem: {} as RetScnItem,
		Ret: {} as Ret,
	};
}

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
	const scan = attrParserV2(dScan, ["id", "id_kanban", "status", "updatedAt"]);
	const kanban = attrParserV2(dKanban, [
		"nomor_kanban",
		"createdAt",
		"keterangan",
	]);
	const sjIn = attrParserV2(dSJIn, ["nomor_surat"]);
	const po = attrParserV2(dPo, ["nomor_po"]);
	const cust = attrParserV2(dCust, ["name"]);

	const num = NumberOrderAttribute<TScan>('"dScan"."id"');

	type Ret = typeof scan.obj & {
		number?: number;
		dKanban: typeof kanban.obj & {
			dPo: typeof po.obj & {dCust: typeof cust.obj};
			dSJIn: typeof sjIn.obj;
		};
	};

	return {scan, kanban, sjIn, po, cust, num, Ret: {} as Ret};
}

export function printScanAttributes() {
	const scan = attrParserV2(dScan, ["id_kanban", "updatedAt", "lot_no_imi"]);
	const scnItem = attrParserV2(dScanItem);
	const kanban = attrParserV2(dKanban, [
		"id",
		"keterangan",
		"nomor_kanban",
		"list_mesin",
	]);
	const po = attrParserV2(dPo, ["id"]);
	const cust = attrParserV2(dCust, ["name"]);
	const knbItem = attrParserV2(dKnbItem, ["id"]);
	const item = attrParserV2(dItem, [
		"instruksi",
		"kategori_mesinn",
		"name",
		"kode_item",
	]);
	const inItem = attrParserV2(dInItem, ["id", "lot_no"]);
	const poItem = attrParserV2(dPoItem, ["unit1", "unit2", "unit3"]);
	const sjIn = attrParserV2(dSJIn, ["nomor_surat"]);

	type Ret = typeof scan.obj & {
		dScanItems: (typeof scnItem.obj & {
			knbItem?: typeof knbItem.obj & {
				dKanban: typeof kanban.obj & {
					dPo: typeof po.obj & {dCust: typeof cust.obj};
				};
				dItem: typeof item.obj;
				dInItem?: typeof inItem.obj & {
					dPoItem: typeof poItem.obj;
					dSJIn: typeof sjIn.obj;
				};
			};
		})[];
	};

	return {
		scnItem,
		scan,
		kanban,
		po,
		cust,
		knbItem,
		item,
		inItem,
		poItem,
		sjIn,
		Ret: {} as Ret,
	};
}

export function getScanAttributesV2() {
	const scn = attrParserExclude(dScan, ["id_kanban"]);
	const scnId = attrParserV2(dScan, ["id"]);
	const knb = attrParserV2(dKanban, [
		"id",
		"list_mesin",
		"keterangan",
		"createdAt",
	]);
	const scItem = attrParserExclude(dScanItem, ["id_scan"]);
	const scItemId = attrParserV2(dScanItem, ["id"]);
	const knbItem = attrParserV2(dKnbItem, ["id", "qty1", "qty2", "qty3"]);
	const user = attrParserV2(dUser, ["name"]);
	const bin = attrParserV2(dSJIn, ["nomor_surat"]);
	const po = attrParserV2(dPo, ["id", "nomor_po"]);
	const cust = attrParserV2(dCust, ["id", "name"]);
	const mItem = attrParserV2(dItem, ["kode_item", "name", "id"]);
	const binItem = attrParserV2(dInItem, ["id"]);
	const sciReject = attrParserV2(dRejItem);
	const poItem = attrParserV2(dPoItem, ["unit1", "unit2", "unit3"]);

	type Ret = Partial<typeof scn.obj> & {
		dScanItems?: (typeof scItem.obj & {
			dRejItems: (typeof sciReject.obj & {
				dScanItem: typeof scItemId.obj & {dScan: typeof scnId.obj};
			})[];
		})[];
		dKanban: typeof knb.obj & {
			[dKanban._aliasCreatedBy]: typeof user.obj;
			dSJIn: typeof bin.obj & {
				dPo: typeof po.obj & {dCust: typeof cust.obj};
			};
			dScans: (typeof scn.obj & {
				dScanItems: (typeof scItem.obj & {
					dRejItems: typeof sciReject.obj;
				})[];
			})[];
			dKnbItems: (typeof knbItem.obj & {
				dItem: typeof mItem.obj;
				dInItem: typeof binItem.obj & {
					dPoItem: typeof poItem.obj;
				};
			})[];
		};
	};

	return {
		scn,
		scnId,
		knb,
		scItem,
		scItemId,
		knbItem,
		user,
		bin,
		po,
		cust,
		mItem,
		binItem,
		poItem,
		sciReject,
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

export function getPOSppbOutAttributes() {
	const kanban = attrParserV2(dKanban, ["id"]);
	const sjIn = attrParserV2(dSJIn);
	const po = attrParserV2(dPo);
	const scn = attrParserV2(dScan, ["id", "lot_no_imi", "status"]);
	const scnItem = attrParserV2(dScanItem, ["qty1", "qty2", "qty3"]);
	const rejItem = attrParserExclude(dRejItem, ["id", "id_item"]);
	const item = attrParserV2(dItem, ["name", "kode_item", "id"]);
	const inItem = attrParserV2(dInItem, [
		"id",
		"qty1",
		"qty2",
		"qty3",
		"lot_no",
	]);
	const sjOut = attrParserExclude(dSjOut, ["id"]);
	const outItem = attrParserV2(dOutItem, ["id", "qty1", "qty2", "qty3"]);
	const poItem = attrParserV2(dPoItem, ["id", "unit1", "unit2", "unit3"]);
	const knbItem = attrParserV2(dKnbItem, ["id", "qty1", "qty2", "qty3"]);

	const sjInInclude: Includeable = {
		...sjIn,
		include: [
			{
				...inItem,
				include: [item, poItem, {...outItem, include: [sjOut]}],
			},
			{
				...kanban,
				include: [
					knbItem,
					{
						...scn,
						include: [
							scnItem,
							{
								...scn,
								as: dScan._aliasReject,
								include: [{...scnItem, separate: true, include: [rejItem]}],
							},
						],
					},
				],
			},
		],
	};

	type RetSjIn = typeof sjIn.obj & {
		dKanbans: RetKanban[];
		dInItems: (typeof inItem.obj & {
			dItem: typeof item.obj;
			dPoItem: typeof poItem.obj;
			dOutItems: (typeof outItem.obj & {dSjOut: typeof sjOut.obj})[];
		})[];
	};

	type RetKanban = typeof kanban.obj & {
		dKnbItems: typeof knbItem.obj[];
		dScans: (typeof scn.obj & {
			dScanItems: typeof scnItem.obj[];
			[dScan._aliasReject]?: typeof scn.obj & {
				dScanItems: (typeof scnItem.obj & {
					dRejItems: typeof rejItem.obj[];
				})[];
			};
		})[];
	};

	type Ret = typeof po.obj & {dSJIns: RetSjIn[]};

	return {
		kanban,
		sjIn,
		po,
		sjOut,
		scn,
		scnItem,
		rejItem,
		item,
		inItem,
		outItem,
		poItem,
		knbItem,
		sjInInclude,
		RetKanban: {} as RetKanban,
		RetSjIn: {} as RetSjIn,
		Ret: {} as Ret,
	};
}

export function printSppbOutAttributes() {
	const {
		scn: scan,
		scnItem,
		rejItem,
		kanban,
		sjIn,
		po,
	} = getPOSppbOutAttributes();
	const sjOut = attrParserV2(dSjOut, [
		"id",
		"id_customer",
		"date",
		"invoice_no",
		"keterangan",
	]);
	const vehicle = attrParserV2(dVehicle, ["name"]);
	const customer = attrParserV2(dCust, ["name", "alamat"]);
	const outItem = attrParserV2(dOutItem, ["qty1", "qty2", "qty3"]);
	const inItem = attrParserV2(dInItem, ["lot_no"]);
	const item = attrParserV2(dItem, [
		"instruksi",
		"kategori_mesinn",
		"name",
		"keterangan",
	]);
	const poItem = attrParserV2(dPoItem, ["unit1", "unit2", "unit3"]);
	const doc = attrParserV2(dDoc, ["doc_no", "tgl_efektif", "revisi", "terbit"]);

	const sjInInclude: Includeable = {
		...sjIn,
		include: [
			{
				...kanban,
				include: [
					doc,
					{
						...scan,
						include: [
							scnItem,
							{
								...scan,
								as: dScan._aliasReject,
								include: [{...scnItem, include: [rejItem]}],
							},
						],
					},
				],
			},
		],
	};

	type Ret = typeof sjOut.obj & {
		dVehicle: typeof vehicle.obj;
		dCust: typeof customer.obj;
		dOutItems: (typeof outItem.obj & {
			dInItem: typeof inItem.obj & {
				dSJIn: typeof sjIn.obj & {
					dKanbans: (typeof kanban.obj & {
						dScans: (typeof scan.obj & {
							dScanItems: typeof scnItem.obj[];
							[dScan._aliasReject]?: typeof scan.obj & {
								dScanItems: (typeof scnItem.obj & {
									dRejItems: typeof rejItem.obj[];
								})[];
							};
						})[];
						dDoc: typeof doc.obj;
					})[];
				};
				dItem: typeof item.obj;
				dPoItem: typeof poItem.obj & {dPo: typeof po.obj};
			};
		})[];
	};

	return {
		sjOut,
		scnItem,
		rejItem,
		vehicle,
		customer,
		outItem,
		inItem,
		item,
		poItem,
		po,
		sjIn,
		kanban,
		scan,
		doc,
		sjInInclude,
		Ret: {} as Ret,
	};
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

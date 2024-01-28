import {Includeable} from 'sequelize';

import {Route, TScanTarget, UnitQty, UnitUnit} from '@appTypes/app.type';
import {
	SInUpsert,
	SPoUpsert,
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tCustomerSPPBOutItem,
	TIndex,
	tKanban,
	tKanbanItem,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
	TScan,
	tScan,
	tUser,
	ZCreated,
} from '@appTypes/app.zod';
import {
	attrParser,
	attrParserExclude,
	attrParserV2,
	dCust,
	dDoc,
	dIndex,
	dInItem,
	dItem,
	dKanban,
	dKatMesin,
	dKnbItem,
	dMesin,
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
	literalFieldType,
	NumberOrderAttribute,
	oInItem,
	oItem,
	oOut,
	oPo,
	oPoItem,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmMenu,
	OrmPOItemSppbIn,
	oSjIn,
	oStock,
	oSup,
	whereNearestDate,
} from '@database';
import {getSJInGrade, RetCalculateScore} from '@db/getSjGrade';
import {PO_STATUS} from '@enum';

export function getPrintPoAttributes() {
	const Po = attrParserExclude(dPo, ['id_customer']);
	const PoItem = attrParserExclude(dPoItem, ['id', 'id_po', 'master_item_id']);
	const InItem = attrParserV2(dInItem, ['lot_no', 'qty1', 'qty2', 'qty3']);
	const OutItem = attrParserV2(dOutItem, ['qty1', 'qty2', 'qty3']);
	const KnbItem = attrParserV2(dKnbItem, ['id', 'qty1', 'qty2', 'qty3']);
	const ScanItem = attrParserV2(dScanItem, ['qty1', 'qty2', 'qty3']);
	const Kanban = attrParserV2(dKanban, [
		'nomor_kanban',
		'index_id',
		'index_number',
	]);
	const Scan = attrParserV2(dScan, ['status', 'lot_no_imi']);
	const SJIn = attrParserV2(dSJIn, ['nomor_surat']);
	const Item = attrParserV2(dItem, ['name', 'kode_item']);
	const Cust = attrParserV2(dCust, ['name']);
	const tIndex = attrParserV2(dIndex);

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
							include: [{...Kanban, include: [tIndex]}],
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
		grade: RetCalculateScore;
		dCust: typeof Cust.obj;
		dPoItems: typeof PoItem.obj & {
			dItem: typeof Item.obj;
			dInItems?: typeof InItem.obj & {
				dSJIn?: typeof SJIn.obj;
				dOutItems: typeof OutItem.obj & {};
				dKnbItems?: typeof KnbItem.obj & {
					dKanban: typeof Kanban.obj & {
						dIndex?: typeof tIndex.obj;
					};
					dScanItems?: RetScnItem[];
				};
			};
		};
	};

	return {
		tIndex,
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
	const sjIn = attrParserV2(dSJIn, ['tgl', 'id', 'id_po', 'nomor_surat']);
	const po = attrParserV2(dPo, ['nomor_po']);
	const cust = attrParserV2(dCust, ['name', 'id']);
	const inItem = attrParserV2(dInItem);
	const poItem = attrParserV2(dPoItem);
	const item = attrParserV2(dItem);

	type Ret = typeof sjIn.obj & {
		grade?: Awaited<ReturnType<typeof getSJInGrade>>[number];
		dPo: typeof po.obj & {dCust: typeof cust.obj};
		dInItems: (typeof inItem.obj & {
			dPoItem: typeof poItem.obj;
			dItem: typeof item.obj;
		})[];
	};

	return {
		sjIn,
		po,
		cust,
		inItem,
		poItem,
		item,
		Ret: {} as Ret,
	};
}

export function exportKanbanAttributes() {
	const kanban = attrParserV2(OrmKanban, [
		'nomor_kanban',
		'keterangan',
		'index_id',
		'index_number',
	]);
	const tIndex = attrParserV2(dIndex);
	const sjIn = attrParserV2(OrmCustomerSPPBIn, ['id', 'tgl', 'nomor_surat']);
	const inItem = attrParserV2(OrmPOItemSppbIn, [
		'id_item',
		'id',
		'lot_no',
		'qty1',
		'qty2',
		'qty3',
	]);
	const po = attrParserV2(OrmCustomerPO, ['nomor_po']);
	const cust = attrParserV2(OrmCustomer, ['name']);
	const poItem = attrParserV2(OrmCustomerPOItem, [
		'id',
		'unit1',
		'unit2',
		'unit3',
		'harga',
	]);
	const knbItem = attrParserV2(OrmKanbanItem, [
		'id_item',
		'qty1',
		'qty2',
		'qty3',
	]);
	const item = attrParserV2(OrmMasterItem, [
		'kode_item',
		'name',
		'keterangan',
		'instruksi',
		'kategori_mesinn',
	]);

	type Ret = typeof kanban.obj & {
		dIndex?: TIndex;
		OrmCustomerSPPBIn: typeof sjIn.obj & {
			OrmPOItemSppbIns: typeof inItem.obj[];
		};
		OrmCustomerPO: typeof po.obj & {
			OrmCustomer: typeof cust.obj;
			OrmCustomerPOItems: typeof poItem.obj[];
		};
		OrmKanbanItems: (typeof knbItem.obj & {OrmMasterItem: typeof item.obj})[];
	};

	type Output = Record<string, string | number>;

	return {
		tIndex,
		kanban,
		sjIn,
		inItem,
		po,
		cust,
		poItem,
		knbItem,
		item,
		Ret: {} as Ret,
		Output: {} as Output,
	};
}
export function exportScanAttributes(route: Route['route']) {
	type Output = Record<
		| 'NO'
		| 'TANGGAL PROSES'
		| 'CUSTOMER'
		| 'PART NAME'
		| 'PART NO'
		| 'QTY / JUMLAH'
		| 'WAKTU / JAM PROSES'
		| 'NO LOT CUSTOMER'
		| 'NO LOT IMI'
		| 'PROSES'
		| 'NOMOR KANBAN'
		| 'NOMOR MESIN'
		| 'NAMA MESIN'
		| 'KETERANGAN',
		string
	>;

	const A = attrParser(tScan, ['date', 'lot_no_imi', `item_${route}`]);
	const B = attrParser(tKanban, ['nomor_kanban', 'list_mesin', 'keterangan']);
	const C = attrParser(tCustomerSPPBIn, ['id']);
	const D = attrParser(tPOItemSppbIn, ['id', 'id_item', 'lot_no']);
	const E = attrParser(tCustomerPO, ['id']);
	const F = attrParser(tCustomer, ['name']);
	const G = attrParser(tPOItem, ['id', 'unit1', 'unit2', 'unit3']);
	const H = attrParser(tKanbanItem, ['id_item']);
	const I = attrParser(tMasterItem, [
		'instruksi',
		'kategori_mesinn',
		'name',
		'kode_item',
	]);
	const J = attrParser(tPOItemSppbIn, ['id']);

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
	const scan = attrParserV2(dScan, ['id', 'id_kanban', 'status', 'createdAt']);
	const kanban = attrParserV2(dKanban, [
		'nomor_kanban',
		'index_id',
		'index_number',
		'createdAt',
		'keterangan',
	]);
	const sjIn = attrParserV2(dSJIn, ['nomor_surat']);
	const po = attrParserV2(dPo, ['nomor_po']);
	const cust = attrParserV2(dCust, ['name']);
	const tIndex = attrParserV2(dIndex);

	const num = NumberOrderAttribute<TScan>('"dScan"."id"');

	type Ret = typeof scan.obj & {
		number?: number;
		dKanban: typeof kanban.obj & {
			dIndex?: typeof tIndex.obj;
			dPo: typeof po.obj & {dCust: typeof cust.obj};
			dSJIn: typeof sjIn.obj;
		};
	};

	return {scan, tIndex, kanban, sjIn, po, cust, num, Ret: {} as Ret};
}

export function printScanAttributes() {
	const rejItem = attrParserExclude(dRejItem, ['id', 'id_item']);
	const tIndex = attrParserV2(dIndex);
	const scan = attrParserV2(dScan, [
		'id_kanban',
		'notes',
		'updatedAt',
		'lot_no_imi',
		'createdAt',
	]);
	const scnItem = attrParserV2(dScanItem);
	const kanban = attrParserV2(dKanban, [
		'id',
		'keterangan',
		'nomor_kanban',
		'index_id',
		'index_number',
		'list_mesin',
	]);
	const po = attrParserV2(dPo, ['id']);
	const cust = attrParserV2(dCust, ['name']);
	const knbItem = attrParserV2(dKnbItem, ['id']);
	const item = attrParserV2(dItem, [
		'instruksi',
		'kategori_mesinn',
		'name',
		'kode_item',
	]);
	const inItem = attrParserV2(dInItem, ['id', 'lot_no']);
	const poItem = attrParserV2(dPoItem, ['unit1', 'unit2', 'unit3']);
	const sjIn = attrParserV2(dSJIn, ['nomor_surat']);

	type Ret = typeof scan.obj & {
		dScanItems: (typeof scnItem.obj & {
			dRejItems: typeof rejItem.obj[];
			dKnbItem?: typeof knbItem.obj & {
				dKanban: typeof kanban.obj & {
					dIndex?: typeof tIndex.obj;
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
		tIndex,
		knbItem,
		item,
		inItem,
		poItem,
		sjIn,
		rejItem,
		Ret: {} as Ret,
	};
}

export function getScanAttributesV2() {
	const scn = attrParserExclude(dScan, ['id_kanban']);
	const scnId = attrParserV2(dScan, ['id']);
	const knb = attrParserV2(dKanban, [
		'id',
		'list_mesin',
		'keterangan',
		'createdAt',
	]);
	const scItem = attrParserExclude(dScanItem, ['id_scan']);
	const scItemId = attrParserV2(dScanItem, ['id']);
	const knbItem = attrParserV2(dKnbItem, ['id', 'qty1', 'qty2', 'qty3']);
	const user = attrParserV2(dUser, ['name']);
	const bin = attrParserV2(dSJIn, ['nomor_surat']);
	const po = attrParserV2(dPo, ['id', 'nomor_po']);
	const cust = attrParserV2(dCust, ['id', 'name']);
	const mItem = attrParserV2(dItem, ['kode_item', 'name', 'id']);
	const binItem = attrParserV2(dInItem, ['id', 'lot_no']);
	const sciReject = attrParserV2(dRejItem);
	const poItem = attrParserV2(dPoItem, ['unit1', 'unit2', 'unit3']);

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
		'lot_no_imi',
		'item_qc_reject',
		'item_qc_reject_category',
		'notes',
		'item_from_kanban',
		'id_customer',
		`item_${route}`,
		`status_${route}`,
	]);
	const B = attrParser(tKanban, [
		'id',
		'nomor_kanban',
		'keterangan',
		'list_mesin',
		'createdAt',
	]);
	const C = attrParser(tUser, ['name']);
	const D = attrParser(tCustomerPO, ['nomor_po']);
	const E = attrParser(tCustomer, ['name']);
	const F = attrParser(tCustomerSPPBIn, ['nomor_surat']);
	const G = attrParser(tKanbanItem, ['id_item', 'id', 'qty1', 'qty2', 'qty3']);
	const H = attrParser(tPOItemSppbIn, ['id']);
	const I = attrParser(tPOItem);
	const J = attrParser(tMasterItem, ['kode_item', 'name']);

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
	const B = attrParser(tCustomer, ['name']);
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
	const tIndex = attrParserV2(dIndex);
	const outItem = attrParserV2(dOutItem, [
		'id',
		'id_item',
		'qty1',
		'qty2',
		'qty3',
	]);
	const sjOut = attrParserV2(dSjOut);
	const inItem = attrParserV2(dInItem, [
		'id_item',
		'id_sppb_in',
		'master_item_id',
	]);
	const sjIn = attrParserV2(dSJIn, ['id_po']);
	const cust = attrParserV2(dCust, ['name']);
	const vehicle = attrParserV2(dVehicle, ['name']);

	type Ret = typeof sjOut.obj & {
		dIndex?: typeof tIndex.obj;
		dCust: typeof cust.obj;
		dVehicle: typeof vehicle.obj;
		dOutItems: (typeof outItem.obj & {
			dInItem: typeof inItem.obj & {
				dSJIn: typeof sjIn.obj;
			};
		})[];
	};

	return {
		outItem,
		sjOut,
		inItem,
		sjIn,
		cust,
		tIndex,
		vehicle,
		Ret: {} as Ret,
	};
}

export function getPOScoreAttributes() {
	const attrWithQty: (keyof UnitQty | keyof ZCreated)[] = [
		'qty1',
		'qty2',
		'qty3',
		'createdAt',
	];

	const po = attrParserV2(dPo, ['id']);
	const poItem = attrParserV2(dPoItem, attrWithQty);
	const inItem = attrParserV2(dInItem, attrWithQty);
	const outItem = attrParserV2(dOutItem, attrWithQty);

	type Ret = typeof po.obj & {
		dPoItems: (typeof poItem.obj & {
			dInItems: (typeof inItem.obj & {dOutItems: typeof outItem.obj[]})[];
		})[];
	};

	return {po, poItem, inItem, outItem, Ret: {} as Ret};
}

export function getPOSppbOutAttributes() {
	const kanban = attrParserV2(dKanban, [
		'id',
		'nomor_kanban',
		'index_id',
		'index_number',
	]);
	const sjIn = attrParserV2(dSJIn);
	const po = attrParserV2(dPo);
	const scn = attrParserV2(dScan, ['id', 'lot_no_imi', 'status', 'createdAt']);
	const scnItem = attrParserV2(dScanItem, [
		'qty1',
		'qty2',
		'qty3',
		'createdAt',
	]);
	const rejItem = attrParserExclude(dRejItem, ['id', 'id_item']);
	const item = attrParserV2(dItem, ['name', 'kode_item', 'id']);
	const inItem = attrParserV2(dInItem, [
		'id',
		'qty1',
		'qty2',
		'qty3',
		'lot_no',
	]);
	const sjOut = attrParserExclude(dSjOut, ['id']);
	const outItem = attrParserV2(dOutItem, ['id', 'qty1', 'qty2', 'qty3']);
	const poItem = attrParserV2(dPoItem, [
		'id',
		'unit1',
		'unit2',
		'unit3',
		'harga',
		'discount',
		'discount_type',
	]);
	const knbItem = attrParserV2(dKnbItem, [
		'id',
		'id_item',
		'qty1',
		'qty2',
		'qty3',
	]);

	const a = literalFieldType<Ret>('dSJIns.dKanbans.dScans.createdAt');
	const b = literalFieldType<Ret>(
		'dSJIns.dKanbans.dScans.dScanItems.createdAt',
	);

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
							{...scnItem, where: whereNearestDate(a, b)},
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
		knbItem,
		sjIn,
		po,
	} = getPOSppbOutAttributes();
	const tIndex = attrParserV2(dIndex);
	const sjOut = attrParserV2(dSjOut, [
		'id',
		'id_customer',
		'date',
		'invoice_no',
		'keterangan',
		'index_id',
		'index_number',
	]);
	const vehicle = attrParserV2(dVehicle, ['name']);
	const customer = attrParserV2(dCust, ['name', 'alamat']);
	const outItem = attrParserV2(dOutItem, ['qty1', 'qty2', 'qty3']);
	const inItem = attrParserV2(dInItem, ['id', 'lot_no']);
	const item = attrParserV2(dItem, [
		'kode_item',
		'instruksi',
		'kategori_mesinn',
		'name',
		'keterangan',
	]);
	const poItem = attrParserV2(dPoItem, ['unit1', 'unit2', 'unit3', 'harga']);
	const doc = attrParserV2(dDoc, ['doc_no', 'tgl_efektif', 'revisi', 'terbit']);

	const sjInInclude: Includeable = {
		...sjIn,
		include: [
			{
				...kanban,
				include: [
					doc,
					knbItem,
					{...tIndex, as: dIndex._alias1},
					{
						...scan,
						include: [
							scnItem,
							{
								...scan,
								as: dScan._aliasReject,
								include: [{...scnItem, separate: true, include: [rejItem]}],
							},
						],
					},
				],
			},
		],
	};

	type Ret = typeof sjOut.obj & {
		dIndex?: typeof tIndex.obj;
		dVehicle: typeof vehicle.obj;
		dCust: typeof customer.obj;
		dOutItems: (typeof outItem.obj & {
			dInItem: typeof inItem.obj & {
				dSJIn: typeof sjIn.obj & {
					dKanbans: (typeof kanban.obj & {
						[dIndex._alias1]: typeof tIndex.obj;
						dKnbItems: typeof knbItem.obj[];
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
		tIndex,
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
	const A = attrParser(tKanban, ['id']);
	const B = attrParser(tCustomerSPPBIn);
	const C = attrParser(tCustomerPO);
	const D = attrParser(tScan, [
		'item_finish_good',
		'status_finish_good',
		'lot_no_imi',
	]);
	const E = attrParser(tPOItemSppbIn, ['id', 'qty1', 'qty2', 'qty3', 'lot_no']);
	const F = attrParser(tCustomerSPPBOutItem, ['id', 'qty1', 'qty2', 'qty3']);
	const G = attrParser(tMasterItem, ['name', 'kode_item', 'id']);
	const H = attrParser(tPOItem, ['id', 'unit1', 'unit2', 'unit3']);
	const I = attrParser(tKanbanItem, ['id', 'qty1', 'qty2', 'qty3']);

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

export function getRejectAttributes() {
	const rejScan = attrParserV2(dRejItem, ['id', 'reason']);
	const scanItem = attrParserV2(dScanItem, ['id']);
	const scan = attrParserV2(dScan, ['lot_no_imi', 'status']);
	const kanban = attrParserV2(dKanban, [
		'nomor_kanban',
		'index_id',
		'index_number',
	]);
	const tIndex = attrParserV2(dIndex);

	type Ret = typeof rejScan.obj & {
		dScanItem: typeof scanItem.obj & {
			dScan: typeof scan.obj & {
				dKanban: typeof kanban.obj & {dIndex: typeof tIndex.obj};
			};
		};
	};

	return {rejScan, scanItem, scan, kanban, tIndex, Ret: {} as Ret};
}

export function dashboardMesinAttributes() {
	const scan = attrParserV2(dScan, ['status']);
	const scnItem = attrParserExclude(dScanItem, [
		'id',
		'id_kanban_item',
		'id_scan',
	]);
	const knbItem = attrParserV2(dKnbItem, ['id_mesin']);
	const inItem = attrParserV2(dInItem, ['id']);
	const poItem = attrParserV2(dPoItem, ['unit1', 'unit2', 'unit3']);
	const mesin = attrParserExclude(dMesin, ['name']);
	const katMesin = attrParserV2(dKatMesin, ['id', 'name', 'color']);

	type Ret = typeof scnItem.obj & {
		dScan: typeof scan.obj;
		dKnbItem: typeof knbItem.obj & {
			dInItem: typeof inItem.obj & {dPoItem: typeof poItem.obj};
			dMesin?: typeof mesin.obj & {dKatMesin: typeof katMesin.obj};
		};
	};

	type Rett = Record<
		string,
		{
			mesin: Ret['dKnbItem']['dMesin'];
			data: {planning: UnitQty; produksi: UnitQty; unit: UnitUnit};
		}
	>;

	return {
		scan,
		inItem,
		scnItem,
		knbItem,
		mesin,
		katMesin,
		poItem,

		Ret: {} as Ret,
		rootRet: dScanItem.name,
		Rett: {} as Rett,
	};
}

export function internalPoAttributes() {
	const po = attrParserV2(oPo);
	const item = attrParserV2(oItem);
	const poItem = attrParserV2(oPoItem);
	const sup = attrParserV2(oSup);
	const tIndex = attrParserV2(dIndex);
	const inItem = attrParserV2(oInItem);

	type Ret = SPoUpsert;

	return {po, inItem, item, poItem, sup, tIndex, Ret: {} as Ret};
}

export function internalInAttributes() {
	const sjIn = attrParserV2(oSjIn);
	const inItem = attrParserV2(oInItem);
	const po = attrParserV2(oPo);
	const item = attrParserV2(oItem);
	const poItem = attrParserV2(oPoItem);
	const sup = attrParserV2(oSup);
	const tIndex = attrParserV2(dIndex);

	type Ret = SInUpsert;

	return {po, sjIn, tIndex, inItem, item, poItem, sup, Ret: {} as Ret};
}

export function internalStockAttributes() {
	const stock = attrParserV2(oStock);
	const item = attrParserV2(oItem);
	const sup = attrParserV2(oSup);
	const out = attrParserV2(oOut);

	type Ret = typeof stock.obj & {
		usedQty: number;
		isClosed: boolean;
		oSup: typeof sup.obj;
		oItem: typeof item.obj;
		oOuts: typeof out.obj[];
	};

	return {stock, item, sup, out, Ret: {} as Ret};
}

export function menuAttributes() {
	const menu = attrParserV2(OrmMenu, [
		'id',
		'title',
		'path',
		'parent_id',
		'accepted_role',
		'icon',
		'index',
	]);

	type Ret = typeof menu.obj & {
		OrmMenus?: (typeof menu.obj & {
			// OrmMenus?: typeof menu.obj[];
		})[];
	};

	return {menu, RetSub: {} as Ret, Ret: {} as Omit<Ret, 'OrmMenus'>};
}

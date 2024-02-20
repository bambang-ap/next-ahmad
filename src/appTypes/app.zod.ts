import {z, ZodError} from 'zod';

import {SelectPropsData} from '@components';
import {defaultLimit, regIndexPrefix, regMd5} from '@constants';
import {
	CATEGORY_REJECT_DB,
	DiscType,
	IndexNumber,
	INTERNAL_PO_STATUS,
	REJECT_REASON,
	REJECT_REASON_VIEW,
	REQ_FORM_STATUS,
} from '@enum';
import {atLeastOneDefined} from '@utils';

export type TDecimal = z.infer<typeof zDecimal>;
export const zDecimal = z
	.string()
	.transform(str => parseFloat(str))
	.or(z.number());

// export const zDecimal = z.number().or(
// 	z.string().transform(str => {
// 		const val = parseFloat(str);

// 		if (val % 1 !== 0) return val;

// 		return parseFloat(val.toFixed(decimalValue));
// 	}),
// );

export const zMd5 = z.string().regex(regMd5);

export type ModalType = z.infer<typeof uModalType>;
export const uModalType = z.union([
	z.undefined(),
	z.literal('add'),
	z.literal('edit'),
	z.literal('delete'),
	z.literal('other'),
]);
export type ModalTypePreview = z.infer<typeof uModalTypePreview>;
export const uModalTypePreview = z.union([uModalType, z.literal('preview')]);

export type ModalTypeSelect = z.infer<typeof uModalTypeSelect>;
export const uModalTypeSelect = z.union([
	uModalTypePreview,
	z.literal('select'),
]);

export type TableFormValue = z.infer<typeof tableFormValue>;
export const tableFormValue = z.object({
	id: z.string().optional(),
	ids: z.string().array().optional(),
	search: z.string().optional(),
	pageTotal: z.number().optional(),
	page: z.number().optional().default(1),
	limit: z.number().optional().default(defaultLimit),
});

export type ZId = z.infer<typeof zId>;
export const zId = z.object({id: z.string()});

export type ZDate = z.infer<typeof zDate>;
export const zDate = z.string().optional();

export type ZDateR = z.infer<typeof zDateR>;
export const zDateR = z.string();

export type ZCreated = z.infer<typeof zCreated>;
export const zCreated = z.object({createdAt: zDate});
export type ZUpdated = z.infer<typeof zUpdated>;
export const zUpdated = z.object({updatedAt: zDate});
export type ZCreatedUpdated = z.infer<typeof zCreatedUpdated>;
export const zCreatedUpdated = zCreated.extend(zUpdated.shape);

export type ZDiscount = z.infer<typeof zDiscount>;
export const zDiscount = z.object({
	discount: zDecimal.nullish(),
	discount_type: z.nativeEnum(DiscType).nullish(),
});

export type ZIds = z.infer<typeof zIds>;
export const zIds = z.object({ids: z.string().array()});

export const indexAlias = 'index_str' as const;

export type ZIndex = z.infer<typeof zIndex>;
export const zIndex = z.object({
	index_id: z.string(),
	index_number: z.string(),
	[indexAlias]: z.string().optional(),
});

export type TIndex = z.infer<typeof tIndex>;
export const tIndex = zId.extend({
	prefix: z.string().regex(regIndexPrefix),
	target: z.nativeEnum(IndexNumber),
	keterangan: z.string().nullish(),
	...zCreated.shape,
});

export type TUser = z.infer<typeof tUser>;
export const tUser = zId.extend({
	email: z.string().email(),
	name: z.string(),
	role: z.string(),
	password: z.string().optional(),
});

export type TUserUpsert = z.infer<typeof tUserUpsert>;
export const tUserUpsert = tUser
	.partial({id: true})
	.extend({confirmPassword: z.string().optional()})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Password tidak sama',
		path: ['confirmPassword'],
	});

export type TUserSignIn = z.infer<typeof tUserSignIn>;
export const tUserSignIn = tUser
	.pick({email: true, password: true})
	.extend({token: z.string()});

export type TUserLogin = z.infer<typeof tUserLogin>;
export const tUserLogin = zId.extend({
	id_user: z.string(),
	expiredAt: z.date(),
});

export type TSession = z.infer<typeof tSession>;
export const tSession = z.object({expires: z.string(), user: tUser.nullish()});

export type TRole = z.infer<typeof tRole>;
export const tRole = z.object({id: z.string(), name: z.string()});

export type TCustomer = z.infer<typeof tCustomer>;
export const tCustomer = zId.extend({
	name: z.string(),
	npwp: z.string(),
	alamat: z.string(),
	no_telp: z.string(),
	up: z.string().optional(),
	ppn: z.boolean().default(true).optional(),
	keterangan: z.string().nullish(),
});

export type TItemUnit = z.infer<typeof tItemUnit>;
export const tItemUnit = z
	.literal('pcs')
	.or(z.literal('drum'))
	.or(z.literal('kg'))
	.or(z.literal('box'))
	.or(z.literal('set'))
	.or(z.literal('carton'))
	.or(z.literal('pallet'));

export type TItemUnitInternal = z.infer<typeof tItemUnitInternal>;
export const tItemUnitInternal = z.string();

export type UnitQty = z.infer<typeof unitQty>;
export const unitQty = z.object({
	qty1: zDecimal,
	qty2: zDecimal.nullish(),
	qty3: zDecimal.nullish(),
	// qty4: zDecimal.nullish(),
	// qty5: zDecimal.nullish(),
});

export type UnitUnit = z.infer<typeof unitUnit>;
export const unitUnit = z.object({
	unit1: tItemUnit,
	unit2: tItemUnit.nullish(),
	unit3: tItemUnit.nullish(),
	// unit4: tItemUnit.nullish(),
	// unit5: tItemUnit.nullish(),
});

export type ZCreatedQty = z.infer<typeof zCreatedQty>;
export const zCreatedQty = unitQty.extend(zCreated.shape);

export type TPOItem = z.infer<typeof tPOItem>;
export const tPOItem = zId.extend({
	master_item_id: z.string(),
	id_po: z.string(),
	harga: zDecimal.optional(),
	...unitUnit.shape,
	...unitQty.shape,
	...zCreated.shape,
	...zDiscount.shape,
});

export type TPOItemSppbIn = z.infer<typeof tPOItemSppbIn>;
export const tPOItemSppbIn = zId.extend({
	id_sppb_in: z.string(),
	id_item: z.string(),
	master_item_id: z.string(),
	lot_no: z.string().optional(),
	included: z.boolean(),
	...zCreated.shape,
	...unitQty.shape,
	...zDiscount.shape,
});

export type TCustomerPO = z.infer<typeof tCustomerPO>;
export const tCustomerPO = zId.extend({
	tgl_po: zDateR,
	due_date: zDate,
	id_customer: z.string(),
	nomor_po: z.string(),
	...zCreated.shape,
	...zDiscount.shape,
});

export type TCustomerPOExtended = z.infer<typeof tCustomerPOExtended>;
export const tCustomerPOExtended = tCustomerPO.extend({
	customer: tCustomer.deepPartial().nullish(),
	po_item: z.array(tPOItem).min(1).optional(),
});

export type TMasterItem = z.infer<typeof tMasterItem>;
export const tMasterItem = zId.extend({
	unit_notes: z.tuple([
		z.tuple([z.literal('Berat/pcs'), zDecimal.nullish()]),
		z.tuple([z.literal('Pcs/Lot'), zDecimal.nullish()]),
		z.tuple([z.literal('Qty/Lot'), zDecimal.nullish(), tItemUnit.nullish()]),
	]),
	harga: zDecimal,
	name: z.string().nullish(),
	kode_item: z.string().nullish(),
	// FIXME: Remove
	kategori_mesin: z.string().nullish(),
	kategori_mesinn: z.string().array(),
	default_mesin: z.string().array().nullish(),
	keterangan: z.string().nullish(),
	instruksi: z.record(
		z
			.object({
				id_instruksi: z.string().min(1),
				hardness: z.string().min(1).array().min(1),
				hardnessKategori: z.string().min(1).array().min(1),
				material: z.string().min(1).array().min(1),
				materialKategori: z.string().array().optional(),
				// materialKategori: z.string().min(1).array().min(1).optional(),
				parameter: z.string().min(1).array().min(1),
				parameterKategori: z.string().min(1).array().min(1),
			})
			.array()
			.min(1),
	),
});

export type TKategoriMesin = z.infer<typeof tKategoriMesin>;
export const tKategoriMesin = zId.extend({
	name: z.string(),
	color: z.string(),
});

export type TMesin = z.infer<typeof tMesin>;
export const tMesin = zId.extend({
	nomor_mesin: z.string(),
	kategori_mesin: z.string(),
	name: z.string().optional(),
});

export type TKendaraan = z.infer<typeof tKendaraan>;
export const tKendaraan = zId.extend({
	name: z.string(),
});

export type TInstruksiKanban = z.infer<typeof tInstruksiKanban>;
export const tInstruksiKanban = zId.extend({
	name: z.string(),
});

export type TKanban = z.infer<typeof tKanban>;
export const tKanban = zId.extend({
	...zIndex.shape,
	...zCreatedUpdated.shape,
	printed: z.number().default(0).optional(),
	id_po: z.string(),
	nomor_kanban: z.string().nullish(),
	id_sppb_in: z.string(),
	keterangan: z.string().nullish(),
	createdBy: z.string(),
	updatedBy: z.string(),
	image: z.string().optional().nullish(),
	doc_id: z.string(),
	list_mesin: z.record(z.string().min(1).array().min(1)),
});

export type TKanbanItem = z.infer<typeof tKanbanItem>;
export const tKanbanItem = zId.extend({
	id_kanban: z.string(),
	id_item: z.string(),
	master_item_id: z.string(),
	id_item_po: z.string(),
	id_mesin: z.string().nullish(),
	...unitQty.shape,
	...zCreated.shape,
});

export type TKanbanUpsertItem = z.infer<typeof tKanbanUpsertItem>;
/** key property of items is id_item */
export const tKanbanUpsertItem = tKanbanItem
	.extend({
		id_sppb_in: z.string().nullish(),
		OrmMasterItem: tMasterItem.optional(),
	})
	.partial({id: true, id_kanban: true});

export type TKanbanUpsert = z.infer<typeof tKanbanUpsert>;
export const tKanbanUpsert = tKanban
	.partial({
		id: true,
		doc_id: true,
		createdBy: true,
		updatedBy: true,
		nomor_kanban: true,
		index_id: true,
		index_number: true,
	})
	.extend({
		id_customer: z.string(),
		items: z.record(tKanbanUpsertItem),
	});

export type TKanbanExtended = z.infer<typeof tKanbanExtended>;
export const tKanbanExtended = tKanban.extend({
	po: tCustomerPOExtended.array().nullish(),
	mesin: tMesin.array().nullish(),
	instruksi_kanban: tInstruksiKanban.array().nullish(),
});

export type ItemsSppb = z.infer<typeof itemsSppb>;
export const itemsSppb = tPOItem.pick({id: true, qty1: true}).partial().array();

export type TCustomerSPPBIn = z.infer<typeof tCustomerSPPBIn>;
export const tCustomerSPPBIn = zId.partial().extend({
	nomor_surat: z.string(),
	id_po: z.string(),
	tgl: zDateR,
	...zCreated.shape,
});

const picker = {id: true, id_sppb_in: true} as const;
const tPOItemSppbInNonId = tPOItemSppbIn.omit(picker);
const tPOItemSppbInOnlyId = tPOItemSppbIn.pick(picker);

export type TUpsertSppbIn = z.infer<typeof tUpsertSppbIn>;
export const tUpsertSppbIn = tCustomerSPPBIn.extend({
	po_item: tPOItemSppbInNonId.and(tPOItemSppbInOnlyId.partial()).array().min(1),
});

const outItemUpsertExclude = zId
	.extend({exclude: z.literal(true)})
	.partial({id: true});
const outItemUpsert = tKanbanUpsertItem
	.extend({exclude: z.literal(false).optional()})
	.omit({
		id_item: true,
		OrmMasterItem: true,
	});
export type TCustomerSPPBOutPoItems = z.infer<typeof tCustomerSPPBOutPoItems>;
export const tCustomerSPPBOutPoItems = z.record(
	outItemUpsert.or(outItemUpsertExclude),
);

export type TCustomerSPPBOutSppbIn = z.infer<typeof tCustomerSPPBOutSppbIn>;
export const tCustomerSPPBOutSppbIn = z.object({
	id_sppb_in: z.string(),
	items: tCustomerSPPBOutPoItems.refine(atLeastOneDefined).refine(
		items => {
			const itemsExcluded = entries(items).map(g => !g[1].exclude);

			if (!itemsExcluded.includes(true)) {
				throw new ZodError([
					{code: 'custom', path: [], message: 'At least 1 included'},
				]);
			}

			return items;
		},
		{message: 'At least 1 included'},
	),
	// customer_no_lot: z.string(),
});

export type TCustomerSPPBOutPo = z.infer<typeof tCustomerSPPBOutPo>;
export const tCustomerSPPBOutPo = z.object({
	id_po: z.string(),
	sppb_in: tCustomerSPPBOutSppbIn.array(),
});

export type TCustomerSPPBOutItem = z.infer<typeof tCustomerSPPBOutItem>;
export const tCustomerSPPBOutItem = zId.extend({
	id_sppb_out: z.string(),
	id_item: z.string(),
	...zCreated.shape,
	...unitQty.shape,
});

export type TCustomerSPPBOut = z.infer<typeof tCustomerSPPBOut>;
export const tCustomerSPPBOut = zId.extend({
	...zIndex.shape,
	...zCreated.shape,
	invoice_no: z.string().nullable(),
	date: zDateR,
	id_kendaraan: z.string(),
	id_customer: z.string(),
	keterangan: z.string().nullish(),
});

export type TCustomerSPPBOutUpsert = z.infer<typeof tCustomerSPPBOutUpsert>;
export const tCustomerSPPBOutUpsert = tCustomerSPPBOut
	.partial({index_id: true, index_number: true, invoice_no: true})
	.extend({
		po: tCustomerSPPBOutPo.array(),
		dCust: tCustomer.partial().optional(),
		dVehicle: tKendaraan.partial().optional(),
	});

export type TMaterial = z.infer<typeof tMaterial>;
export const tMaterial = zId.extend({
	id_kategori: z.string(),
	name: z.string(),
});

export type TMaterialKategori = z.infer<typeof tMaterialKategori>;
export const tMaterialKategori = zId.extend({
	name: z.string(),
});

export type THardness = z.infer<typeof tHardness>;
export const tHardness = zId.extend({
	id_kategori: z.string(),
	keterangan: z.string().optional(),
	name: z.string(),
});

export type THardnessKategori = z.infer<typeof tHardnessKategori>;
export const tHardnessKategori = zId.extend({
	name: z.string(),
});

export type TParameter = z.infer<typeof tParameter>;
export const tParameter = zId.extend({
	id_kategori: z.string(),
	name: z.string(),
	keterangan: z.string().optional(),
});

export type TParameterKategori = z.infer<typeof tParameterKategori>;
export const tParameterKategori = zId.extend({
	name: z.string(),
});

export type TDocument = z.infer<typeof tDocument>;
export const tDocument = zId.extend({
	...zCreatedUpdated.shape,
	doc_no: z.string(),
	tgl_efektif: zDateR,
	revisi: z.string().nullish(),
	terbit: z.string().nullish(),
	keterangan: z.string().optional(),
	target: z.literal('kanban').or(z.literal('qc')).nullish(),
});

export type BaseMenu = z.infer<typeof baseTMenu>;
export const baseTMenu = z.object({
	id: z.string(),
	title: z.string(),
	icon: z.string().optional(),
	path: z.string().nullable(),
	accepted_role: z.string(),
	parent_id: z.string().nullable(),
	index: z.number(),
});

export type TMenu = BaseMenu & {subMenu?: TMenu[]};
export const tMenu: z.ZodType<TMenu> = baseTMenu.extend({
	subMenu: z.lazy(() => tMenu.array()).optional(),
});

export type ScanItem = z.infer<typeof scanItem>;
export const scanItem = z.tuple([z.string()]).rest(z.number().or(z.string()));

export const eCategoryReject = z.nativeEnum(CATEGORY_REJECT_DB);

export type TScanItem = z.infer<typeof tScanItem>;
export const tScanItem = z.object({
	item_produksi: scanItem.array().optional(),
	item_qc: scanItem.array().optional(),
	item_qc_reject: scanItem.array().optional(),
	item_qc_reject_category: z
		.tuple([z.string()])
		.rest(eCategoryReject)
		.array()
		.optional(),
	item_finish_good: scanItem.array().optional(),
	// item_out_barang: scanItem.array().optional(),
});

export type TScanDate = z.infer<typeof tScanDate>;
export const tScanDate = z.object({
	produksi_updatedAt: zDate,
	qc_updatedAt: zDate,
	finish_good_updatedAt: zDate,
});

export type TScan = z.infer<typeof tScan>;
export const tScan = zId.extend({
	...tScanItem.shape,
	...zCreatedUpdated.shape,
	id_customer: z.string(),
	lot_no_imi: z.string().min(1),
	id_kanban: z.string(),
	status_produksi: z.boolean().optional(),
	status_qc: z.boolean().optional(),
	status_finish_good: z.boolean().optional(),
	// status_out_barang: z.boolean().optional(),
	notes: z.string().optional(),
	date: tScanDate.optional(),
	item_from_kanban: z.record(unitQty).optional(),
});

export type TScanTarget = z.infer<typeof tScanTarget>;
export const tScanTarget = z.union([
	z.literal('produksi'),
	z.literal('qc'),
	z.literal('finish_good'),
	// z.literal("out_barang"),
]);

export type TRejectReason = z.infer<typeof tRejectReason>;
export const tRejectReason = z.nativeEnum(REJECT_REASON);

export type TScanNew = z.infer<typeof tScanNew>;
export const tScanNew = zId.extend({
	id_kanban: z.string(),
	id_po: z.string(),
	status: tScanTarget,
	notes: z.string().nullish(),
	lot_no_imi: z.string().min(1),
	id_customer: z.string(),
	is_rejected: z.boolean().optional(),
	id_qc: z.string().nullish(),
	printed: z.number().default(0).optional(),
	...zCreatedUpdated.shape,
});

export type TScanNewItem = z.infer<typeof tScanNewItem>;
export const tScanNewItem = zId.extend({
	...unitQty.shape,
	id_scan: z.string(),
	id_kanban_item: z.string(),
	item_from_kanban: unitQty,
	...zCreated.shape,
});

export type TScanItemReject = z.infer<typeof tScanItemReject>;
export const tScanItemReject = zId.extend({
	...unitQty.shape,
	...zCreated.shape,
	id_item: z.string(),
	reason: tRejectReason,
});

export type TRoute = z.infer<typeof tRoute>;
export const tRoute = z.object({route: tScanTarget});

export type TDashboardTitle = z.infer<typeof tDashboardTitle>;
export const tDashboardTitle = z
	.literal('Mesin')
	.or(z.literal('Customer'))
	.or(z.literal('PO'))
	.or(z.literal('Kendaraan'))
	.or(z.literal('SPPB In'))
	.or(z.literal('SPPB Out'))
	.or(z.literal('Kanban'))
	.or(z.literal('Proses Kanban'))
	.or(z.literal('Parameter'))
	.or(z.literal('Material'))
	.or(z.literal('Hardness'))
	.or(z.literal('Scan Produksi'))
	.or(z.literal('Scan QC'))
	.or(z.literal('Scan Finish Good'));

export type TDashboardInput = z.infer<typeof tDashboardInput>;
export const tDashboardInput = z.object({
	title: tDashboardTitle,
	path: z.string().optional(),
	image: z.string().optional(),
	count: z.promise(z.number()),
	bgColor: z.string().optional(),
});

export type TDashboard = z.infer<typeof tDashboard>;
export const tDashboard = tDashboardInput.extend({count: z.number()});

// NOTE: Internal Type Start here
export type TSupItemRelation = z.infer<typeof tSupItemRelation>;
export const tSupItemRelation = zId.extend({
	item_id: z.string(),
	supplier_id: z.string(),
});

export type TSupplier = z.infer<typeof tSupplier>;
export const tSupplier = zId.extend({
	name: z.string(),
	phone: z.string(),
	alamat: z.string(),
	up: z.string().optional(),
	npwp: z.string().optional(),
});

export type TSupplierUpsert = z.infer<typeof tSupplierUpsert>;
export const tSupplierUpsert = z.object({
	...tSupplier.shape,
	item: z.string().array(),
});

export type TSupplierItem = z.infer<typeof tSupplierItem>;
export const tSupplierItem = zId.extend({
	code_item: z.string().optional(),
	name_item: z.string().optional(),
	...zCreatedUpdated.shape,
});

export type TSupplierItemUpsert = z.infer<typeof tSupplierItemUpsert>;
export const tSupplierItemUpsert = z.object({
	...tSupplierItem.shape,
	supplier: z.string().array(),
});

export type TSupplierPO = z.infer<typeof tSupplierPO>;
export const tSupplierPO = zId.extend({
	ppn: z.boolean().optional(),
	tgl_po: zDateR,
	tgl_req_send: zDateR,
	keterangan: z.string().nullish(),
	ppn_percentage: z.number().min(0).max(100).optional(),
});

export type TSupplierPOItem = z.infer<typeof tSupplierPOItem>;
export const tSupplierPOItem = zId.extend({
	id_po: z.string(),
	id_supplier_item: z.string(),
	harga: zDecimal,
	qty: zDecimal,
	unit: tItemUnitInternal,
});

export type TSupplierPOUpsert = z.infer<typeof tSupplierPOUpsert>;
export const tSupplierPOUpsert = zId.extend({
	...tSupplierPO.shape,
	id_supplier: z.string(),
	items: z.record(
		tSupplierPOItem
			.omit({id_supplier_item: true})
			.partial({id_po: true, id: true}),
	),
});

export type TDashboardView = z.infer<typeof tDashboardView>;
export const tDashboardView = z
	.literal('total')
	.or(z.literal('main'))
	.or(z.literal('bar'))
	.or(z.literal('line'))
	.or(z.literal('machine'))
	.or(z.literal('machine_chart'))
	.or(z.literal('machine_daily'));

export type TDashboardSalesView = z.infer<typeof tDashboardSalesView>;
export const tDashboardSalesView = z
	.literal('nilai')
	.or(z.literal('daily'))
	.or(z.literal('monthly'));

export type TDashboardInternal = z.infer<typeof tDashboardInternal>;
export const tDashboardInternal = z
	.literal('transaksi')
	.or(z.literal('qty'))
	.or(z.literal('m-transaksi'))
	.or(z.literal('d-transaksi'));

export type TSPPBRelation = z.infer<typeof tSPPBRelation>;
export const tSPPBRelation = zId.extend({
	in_id: z.string(),
	out_id: z.string(),
});

export function getRejectSelection() {
	return Object.entries(tRejectReason.enum).map<SelectPropsData<REJECT_REASON>>(
		([, value]) => ({label: REJECT_REASON_VIEW[value], value}),
	);
}

export type SSupplier = z.infer<typeof sSupplier>;
export const sSupplier = zId.extend({
	nama: z.string(),
	alamat: z.string(),
	telp: z.string().nullish(),
	npwp: z.string(),
});

export type SItem = z.infer<typeof sItem>;
export const sItem = zId.extend({
	sup_id: z.string(),
	nama: z.string(),
	kode: z.string(),
	harga: zDecimal,
	ppn: z.boolean().default(false),
});

const sItemReqForm = zId.extend({
	name: z.string(),
	qty: zDecimal,
	unit: tItemUnitInternal,
	code: z.string().optional(),
	keterangan: z.string().optional(),
});

export type SReqForm = z.infer<typeof sReqForm>;
export const sReqForm = zId.extend({
	...zIndex.shape,
	date: zDateR,
	due_date: zDateR,
	items: sItemReqForm.array().min(1),
	status: z.nativeEnum(REQ_FORM_STATUS).default(REQ_FORM_STATUS.req),
	keterangan: z.string().nullish(),
});

export type SPo = z.infer<typeof sPo>;
export const sPo = zId.extend({
	...zIndex.shape,
	...zCreatedUpdated.shape,
	...zDiscount.shape,
	sup_id: z.string(),
	date: zDateR,
	due_date: zDateR,
	keterangan: z.string().nullish(),
});

export type SPoItem = z.infer<typeof oPoItem>;
export const oPoItem = zId.extend({
	id_po: z.string(),
	id_item: z.string(),
	qty: zDecimal,
	unit: tItemUnitInternal,
	...zDiscount.shape,
	...zUpdated.shape,
});

export type SSjIn = z.infer<typeof sSjIn>;
export const sSjIn = zId.extend({
	sup_id: z.string(),
	id_po: z.string().nullish(),
	no_sj: z.string(),
	date: zDate,
	no_lpb: z.string().nullish(),
});

export type SInItem = z.infer<typeof sInItem>;
export const sInItem = zId.extend({
	in_id: z.string(),
	qty: zDecimal.pipe(z.number().min(0.01)),

	id_item: z.string().nullish(),

	nama: z.string().nullish(),
	harga: z.string().nullish(),
	kode: z.string().nullish(),
	unit: tItemUnitInternal.nullish(),
	keterangan: z.string().nullish(),
});

export type SoPoItemUpsert = z.infer<typeof sPoItemUpsert>;
export const sPoItemUpsert = oPoItem.extend({
	oItem: sItem,
	temp_id: z.string(),
	isClosed: z.boolean().optional(),
	oInItems: sInItem.array().optional(),
});

export type SPoUpsert = z.infer<typeof sPoUpsert>;
export const sPoUpsert = sPo
	.partial({id: true, index_id: true, index_number: true})
	.extend({
		dIndex: tIndex.optional(),
		status: z.nativeEnum(INTERNAL_PO_STATUS).optional(),
		oSup: sSupplier.optional(),
		isClosed: z.boolean().optional(),
		oPoItems: sPoItemUpsert
			.partial({id: true, id_po: true, oItem: true, temp_id: true})
			.array()
			.min(1),
	});

export type SInUpsertItem = z.infer<typeof sInUpsertItem>;
export const sInUpsertItem = sInItem
	.extend({
		temp_id: z.string(),
		oPoItem: oPoItem.extend({oItem: sItem.optional()}).optional(),
	})
	.partial({id: true, in_id: true, temp_id: true});

export type SInUpsert = z.infer<typeof sInUpsert>;
export const sInUpsert = sSjIn.partial({id: true}).extend({
	oSup: sSupplier.nullish(),
	oInItems: sInUpsertItem.array().min(1),
	oPo: sPo.extend({dIndex: tIndex.optional()}).optional(),
});

export type SInUpsertManual = z.infer<typeof sInUpsertManual>;
export const sInUpsertManual = sSjIn.partial({id: true, id_po: true}).extend({
	oSup: sSupplier.optional(),
	oInItems: sInItem
		.extend({temp_id: z.string()})
		.partial({temp_id: true, id: true, in_id: true})
		.required({nama: true, harga: true, kode: true, unit: true})
		.array()
		.min(1),
});

export type SStock = z.infer<typeof sStock>;
export const sStock = sItem
	.partial()
	.required({id: true, sup_id: true})
	.omit({nama: true, kode: true})
	.extend({
		...zCreatedUpdated.shape,
		nama: z.string().nullish(),
		kode: z.string().nullish(),

		id_item_in: z.string().nullish(),
		id_item: z.string().nullish(),
		unit: tItemUnitInternal,
		qty: zDecimal,
	});

export type SOutBarang = z.infer<typeof sOutBarang>;
export const sOutBarang = zId.extend({
	qty: zDecimal,
	id_stock: z.string(),
	user: z.string().nullish(),
	keterangan: z.string().nullish(),
	...zCreated.shape,
});

export type TDateFilter = z.infer<typeof tDateFilter>;
export const tDateFilter = z.object({
	filterFrom: z.string(),
	filterTo: z.string(),
	filterMonth: z.number().min(0).max(12).default(1),
	filterYear: z.string().length(4).or(z.number()),
});

export type TMachineFilter = z.infer<typeof tMachineFilter>;
export const tMachineFilter = z.object({
	machineCatId: z.string(),
	machineId: z.string(),
});

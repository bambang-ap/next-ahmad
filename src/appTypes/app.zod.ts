import {z} from 'zod';

import {decimalRegex, defaultLimit} from '@constants';
import {CRUD_ENABLED} from '@enum';

export const decimalSchema = z.string().regex(decimalRegex).transform(Number);

export type ModalType = z.infer<typeof uModalType>;
export const uModalType = z.union([
	z.literal('add'),
	z.literal('edit'),
	z.literal('delete'),
]);
export type ModalTypePreview = z.infer<typeof uModalTypePreview>;
export const uModalTypePreview = z.union([uModalType, z.literal('preview')]);

export type TableFormValue = z.infer<typeof tableFormValue>;
export const tableFormValue = z.object({
	search: z.string().optional(),
	page: z.number().optional().default(1),
	limit: z.number().optional().default(defaultLimit),
	pageTotal: z.number().optional(),
});

export type ZId = z.infer<typeof zId>;
export const zId = z.object({id: z.string()});

export type TUser = z.infer<typeof tUser>;
export const tUser = zId.extend({
	email: z.string().email(),
	name: z.string(),
	role: z.string(),
	password: z.string().optional(),
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
});

export type TItemUnit = z.infer<typeof tItemUnit>;
export const tItemUnit = z.union([
	z.literal('pcs'),
	z.literal('kg'),
	z.literal('box'),
	z.literal('set'),
	z.literal('carton'),
]);

const unitQty = {
	qty1: z.number(),
	qty2: z.number().nullish(),
	qty3: z.number().nullish(),
	qty4: z.number().nullish(),
	qty5: z.number().nullish(),
};

export type TPOItem = z.infer<typeof tPOItem>;
export const tPOItem = zId.extend({
	id_po: z.string(),
	name: z.string(),
	kode_item: z.string(),
	harga: z.number(),
	unit1: tItemUnit,
	unit2: tItemUnit.nullish(),
	unit3: tItemUnit.nullish(),
	unit4: tItemUnit.nullish(),
	unit5: tItemUnit.nullish(),
	...unitQty,
});

export type TPOItemSppbIn = z.infer<typeof tPOItemSppbIn>;
export const tPOItemSppbIn = zId.extend({
	id_sppb_in: z.string(),
	id_item: z.string(),
	...unitQty,
});

export type TCustomerPO = z.infer<typeof tCustomerPO>;
export const tCustomerPO = zId.extend({
	tgl_po: z.string(),
	due_date: z.string().optional(),
	id_customer: z.string(),
	nomor_po: z.string(),
});

export type TCustomerPOExtended = z.infer<typeof tCustomerPOExtended>;
export const tCustomerPOExtended = tCustomerPO.extend({
	customer: tCustomer.deepPartial().nullish(),
	po_item: z.array(tPOItem).optional(),
});

export type TMesin = z.infer<typeof tMesin>;
export const tMesin = zId.extend({
	name: z.string(),
	nomor_mesin: z.string(),
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
	id_po: z.string(),
	id_sppb_in: z.string(),
	keterangan: z.string(),
	createdBy: z.string(),
	updatedBy: z.string(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	image: z.string().optional().nullable(),
	list_mesin: z
		.object({
			id_mesin: z.string().min(47),
			instruksi: z
				.object({
					id_instruksi: z.string().min(47),
					hardness: z.string().min(47).array().min(1),
					hardnessKategori: z.string().min(47).array().min(1),
					material: z.string().min(47).array().min(1),
					materialKategori: z.string().min(47).array().min(1),
					parameter: z.string().min(47).array().min(1),
					parameterKategori: z.string().min(47).array().min(1),
				})
				.array()
				.min(1),
		})
		.array(),
	// .min(1),
});

export type TKanbanItem = z.infer<typeof tKanbanItem>;
export const tKanbanItem = zId.extend({
	id_kanban: z.string(),
	id_item: z.string(),
	...unitQty,
});

/** key property of items is id_item */
const tKanbanUpsertItem = tKanbanItem
	.extend({id_sppb_in: z.string().nullish()})
	.partial({id: true, id_kanban: true});

export type TKanbanUpsert = z.infer<typeof tKanbanUpsert>;
export const tKanbanUpsert = tKanban
	.partial({id: true, createdBy: true, updatedBy: true})
	.extend({
		items: z.record(tKanbanUpsertItem),
	});

export type TKanbanExtended = z.infer<typeof tKanbanExtended>;
export const tKanbanExtended = tKanban.extend({
	po: tCustomerPOExtended.array().nullish(),
	mesin: tMesin.array().nullish(),
	instruksi_kanban: tInstruksiKanban.array().nullish(),
});

export type USPPB = z.infer<typeof uSPPB>;
export const uSPPB = z.union([
	z.literal(CRUD_ENABLED.CUSTOMER_SPPB_IN),
	z.literal(CRUD_ENABLED.CUSTOMER_SPPB_OUT),
]);

export type ItemsSppb = z.infer<typeof itemsSppb>;
export const itemsSppb = tPOItem.pick({id: true, qty1: true}).partial().array();

export type TCustomerSPPBIn = z.infer<typeof tCustomerSPPBIn>;
export const tCustomerSPPBIn = zId.partial().extend({
	nomor_surat: z.string(),
	id_po: z.string(),
	lot_no: z.string(),
	tgl: z.string(),
});

const picker = {id: true, id_sppb_in: true} as const;
const tPOItemSppbInNonId = tPOItemSppbIn.omit(picker);
const tPOItemSppbInOnlyId = tPOItemSppbIn.pick(picker);

export type TUpsertSppbIn = z.infer<typeof tUpsertSppbIn>;
export const tUpsertSppbIn = tCustomerSPPBIn.extend({
	po_item: tPOItemSppbInNonId.and(tPOItemSppbInOnlyId.partial()).array(),
});

export type TCustomerSPPBOut = z.infer<typeof tCustomerSPPBOut>;
export const tCustomerSPPBOut = zId.extend({
	invoice_no: z.string(),
	date: z.string(),
	id_kendaraan: z.string(),
	id_customer: z.string(),
	po: z
		.object({
			id_po: z.string(),
			sppb_in: z
				.object({
					id_sppb_in: z.string(),
					// customer_no_lot: z.string(),
					items: z.record(tKanbanUpsertItem.omit({id_item: true})),
				})
				.array(),
		})
		.array(),
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
});

export type TParameterKategori = z.infer<typeof tParameterKategori>;
export const tParameterKategori = zId.extend({
	name: z.string(),
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

const scanItem = z.tuple([z.string()]).rest(z.number());

export type TScanItem = z.infer<typeof tScanItem>;
export const tScanItem = z.object({
	item_produksi: scanItem.array().optional(),
	item_qc: scanItem.array().optional(),
	item_qc_reject: scanItem.array().optional(),
	item_finish_good: scanItem.array().optional(),
	item_out_barang: scanItem.array().optional(),
});

export type TScan = z.infer<typeof tScan>;
export const tScan = zId.extend({
	...tScanItem.shape,
	lot_no_imi: z.string().min(1),
	id_kanban: z.string(),
	status_produksi: z.boolean().optional(),
	status_qc: z.boolean().optional(),
	status_finish_good: z.boolean().optional(),
	status_out_barang: z.boolean().optional(),
});

export type TScanTarget = z.infer<typeof tScanTarget>;
export const tScanTarget = z.union([
	z.literal('produksi'),
	z.literal('qc'),
	z.literal('finish_good'),
	z.literal('out_barang'),
]);

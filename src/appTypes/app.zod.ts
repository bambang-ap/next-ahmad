import {z} from 'zod';

export type ModalType = z.infer<typeof uModalType>;
export const uModalType = z.union([
	z.literal('add'),
	z.literal('edit'),
	z.literal('delete'),
]);
export type ModalTypePreview = z.infer<typeof uModalTypePreview>;
export const uModalTypePreview = z.union([uModalType, z.literal('preview')]);

export type ZId = z.infer<typeof zId>;
export const zId = z.object({id: z.string()});

export type TCustomer = z.infer<typeof tCustomer>;
export const tCustomer = zId.extend({name: z.string()});

export type TPOItem = z.infer<typeof tPOItem>;
export const tPOItem = zId.extend({
	name: z.string(),
	nomor_po: z.string(),
	qty: z.number(),
});

export type TCustomerPO = z.infer<typeof tCustomerPO>;
export const tCustomerPO = zId.extend({
	name: z.string(),
	id_customer: z.string(),
	nomor_po: z.string(),
});

export type TCustomerPOExtended = z.infer<typeof tCustomerPOExtended>;
export const tCustomerPOExtended = tCustomerPO.extend({
	customer: tCustomer.nullish(),
	po_item: z.array(tPOItem).nullish(),
});

export type TMesin = z.infer<typeof tMesin>;
export const tMesin = zId.extend({
	name: z.string(),
	nomor_mesin: z.string(),
});

export type TCustomerSPPBIn = z.infer<typeof tCustomerSPPBIn>;
export const tCustomerSPPBIn = zId.extend({
	name: z.string(),
	nomor_po: z.string(),
});

export type TCustomerSPPBOut = z.infer<typeof tCustomerSPPBOut>;
export const tCustomerSPPBOut = zId.extend({
	name: z.string(),
	nomor_po: z.string(),
});

export type TInstruksiKanban = z.infer<typeof tInstruksiKanban>;
export const tInstruksiKanban = zId.extend({
	name: z.string(),
	nomor_po: z.string(),
});

export type TKanban = z.infer<typeof tKanban>;
export const tKanban = zId.extend({
	nomor_po: z.string(),
	id_instruksi_kanban: z.string(),
	id_mesin: z.string(),
});

export type TKanbanExtended = z.infer<typeof tKanbanExtended>;
export const tKanbanExtended = tKanban.extend({
	po: tCustomerPO.array().nullish(),
	mesin: tMesin.array().nullish(),
	instruksi_kanban: tInstruksiKanban.array().nullish(),
});

const baseTMenu = z.object({
	id: z.string(),
	title: z.string(),
	icon: z.string(),
	path: z.string().nullable(),
	accepted_role: z.string(),
	parent_id: z.string().nullish(),
	index: z.number(),
});

export type TMenu = z.infer<typeof baseTMenu> & {subMenu?: TMenu[]};
export const tMenu: z.ZodType<TMenu> = baseTMenu.extend({
	subMenu: z.lazy(() => tMenu.array()).optional(),
});

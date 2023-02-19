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
export const tCustomer = zId.and(z.object({name: z.string()}));

export type TPOItem = z.infer<typeof tPOItem>;
export const tPOItem = zId.and(
	z.object({name: z.string(), nomor_po: z.string()}),
);

export type TCustomerPO = z.infer<typeof tCustomerPO>;
export const tCustomerPO = zId.and(
	z.strictObject({
		name: z.string(),
		id_customer: z.string(),
		nomor_po: z.string(),
		customer: tCustomer.nullable(),
		po_item: z.array(tPOItem).optional(),
	}),
);

export type TCustomerSPPBIn = z.infer<typeof tCustomerSPPBIn>;
export const tCustomerSPPBIn = zId.and(
	z.object({name: z.string(), nomor_po: z.string()}),
);

export type TCustomerSPPBOut = z.infer<typeof tCustomerSPPBOut>;
export const tCustomerSPPBOut = zId.and(
	z.object({name: z.string(), nomor_po: z.string()}),
);

export type TInstruksiKanban = z.infer<typeof tInstruksiKanban>;
export const tInstruksiKanban = zId.and(
	z.object({name: z.string(), nomor_po: z.string()}),
);

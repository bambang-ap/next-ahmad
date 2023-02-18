import {z} from 'zod';

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

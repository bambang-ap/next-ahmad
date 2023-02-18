export type ModalType = 'add' | 'edit' | 'delete';
export type ModalTypePreview = 'preview' | 'add' | 'edit' | 'delete';

export type TUser = Record<'id' | 'email' | 'name' | 'role', string> & {
	password?: string;
};

export type Session = {
	expires: string;
	user?: TUser;
};

export type TMenu = {
	parent_id?: string;
	subMenu: TMenu[];
} & Record<'id' | 'title' | 'icon' | 'path' | 'accepted_role', string>;

export type TRole = {
	id: number;
	name: string;
};

export type TMesin = Record<'id' | 'nomor_mesin' | 'name', string>;

export type TCustomerSPPBIn = Record<'id' | 'nomor_po' | 'name', string>;
export type TCustomerSPPBOut = Record<'id' | 'nomor_po' | 'name', string>;
export type TInstruksiKanban = Record<'id' | 'name', string>;

export type {TCustomer, TCustomerPO, TPOItem, ZId} from './app.zod';

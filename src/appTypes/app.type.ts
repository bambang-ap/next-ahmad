export type {
	ModalType,
	ModalTypePreview,
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TInstruksiKanban,
	TPOItem,
	ZId,
} from './app.zod';

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

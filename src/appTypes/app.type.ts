export type {
	ModalType,
	ModalTypePreview,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TInstruksiKanban,
	TKanban,
	TKanbanExtended,
	TMenu,
	TMesin,
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

export type TRole = {
	id: number;
	name: string;
};

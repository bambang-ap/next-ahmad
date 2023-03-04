import type {TKanbanExtended, TScan} from './app.zod';

export type {
	BaseMenu,
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
	TRole,
	TScan,
	TScanTarget,
	TSession,
	TUser,
	USPPB,
	ZId,
} from './app.zod';

export type TDataScan = {dataKanban: TKanbanExtended[]} & TScan;

import type {TKanbanExtended, TScan} from './app.zod';

export type {
	BaseMenu,
	ItemsSppb,
	ModalType,
	ModalTypePreview,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TInstruksiKanban,
	TItemUnit,
	TKanban,
	TKanbanExtended,
	TMenu,
	TMesin,
	TPOItem,
	TPOItemSppbIn,
	TRole,
	TScan,
	TScanTarget,
	TSession,
	TUpsertSppbIn,
	TUser,
	USPPB,
	ZId,
} from './app.zod';

export type TDataScan = {dataKanban: TKanbanExtended[]} & TScan;

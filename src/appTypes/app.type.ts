import type {TKanbanExtended, TScan} from './app.zod';

export type {AppRouter, RouterInput, RouterOutput} from '@trpc/routers';
export type {
	BaseMenu,
	ItemsSppb,
	ModalType,
	ModalTypePreview,
	TableFormValue,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TInstruksiKanban,
	TItemUnit,
	TKanban,
	TKanbanExtended,
	TKanbanItem,
	TKanbanUpsert,
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
	TUserLogin,
	TUserSignIn,
	USPPB,
	ZId,
} from './app.zod';

export type TDataScan = {dataKanban: TKanbanExtended[]} & TScan;

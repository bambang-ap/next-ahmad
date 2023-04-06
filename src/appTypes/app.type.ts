import type {RouterOutput} from '@trpc/routers';

import type {
	THardness,
	THardnessKategori,
	TInstruksiKanban,
	TKanban,
	TKanbanUpsert,
	TMaterial,
	TMaterialKategori,
	TMesin,
	TParameter,
	TParameterKategori,
	TScan,
	TUser,
} from './app.zod';

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
	THardness,
	THardnessKategori,
	TInstruksiKanban,
	TItemUnit,
	TKanban,
	TKanbanExtended,
	TKanbanItem,
	TKanbanUpsert,
	TKendaraan,
	TMaterial,
	TMaterialKategori,
	TMenu,
	TMesin,
	TParameter,
	TParameterKategori,
	TPOItem,
	TPOItemSppbIn,
	TRole,
	TScan,
	TScanItem,
	TScanTarget,
	TSession,
	TUpsertSppbIn,
	TUser,
	TUserLogin,
	TUserSignIn,
	USPPB,
	ZId,
} from './app.zod';

export type TDataScan = {dataKanban: RouterOutput['kanban']['get']} & TScan;
// export type TDataScan = TScan | undefined;

export type PagingResult<T> = {
	rows: T[];
	count: number;
	page: number;
	totalPage: number;
	limit: number;
};

export type KanbanGetRow = TKanban & {
	id_customer?: string;
	items: TKanbanUpsert['items'];
	dataSppbIn?: RouterOutput['sppb']['in']['get'][number];
	dataPo?: RouterOutput['customer_po']['get'][number];
	dataCreatedBy?: TUser;
	dataUpdatedBy?: TUser;
	listMesin?: {
		dataMesin?: TMesin;
		instruksi: {
			dataInstruksi?: TInstruksiKanban;
			parameter: ((TParameter & {kategori?: TParameterKategori}) | undefined)[];
			material: ((TMaterial & {kategori?: TMaterialKategori}) | undefined)[];
			hardness: ((THardness & {kategori?: THardnessKategori}) | undefined)[];
		}[];
	}[];
};

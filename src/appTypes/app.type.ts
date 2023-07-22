import {qtyList} from "@constants";
import type {RouterOutput} from "@trpc/routers";

import type {
	TCustomer,
	TCustomerPO,
	TDocument,
	TKanban,
	TKanbanUpsert,
	TScan,
	TUser,
} from "./app.zod";

export type {
	AppRouter,
	AppRouterCaller,
	RouterInput,
	RouterOutput,
} from "@trpc/routers";
export type {
	BaseMenu,
	ItemsSppb,
	ModalType,
	ModalTypePreview,
	ModalTypeSelect,
	TableFormValue,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TDashboard,
	TDashboardInput,
	TDashboardView,
	TDocument,
	THardness,
	THardnessKategori,
	TInstruksiKanban,
	TItemUnit,
	TKanban,
	TKanbanExtended,
	TKanbanItem,
	TKanbanUpsert,
	TKanbanUpsertItem,
	TKategoriMesin,
	TKendaraan,
	TMasterItem,
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
	TSupplier,
	TSupplierItem,
	TSupplierPO,
	TUpsertSppbIn,
	TUser,
	TUserLogin,
	TUserSignIn,
	USPPB,
	ZId,
} from "./app.zod";

export type TDataScan = {dataKanban: RouterOutput["kanban"]["get"]} & TScan;
export type UQtyList = `qty${typeof qtyList[number]}`;

export type PagingResult<T> = {
	rows: T[];
	count: number;
	page: number;
	totalPage: number;
	limit: number;
};

export type KanbanGetRow = TKanban & {
	dataScan?: TScan;
	id_customer?: string;
	items: TKanbanUpsert["items"];
	OrmCustomerPO?: TCustomerPO & {OrmCustomer: TCustomer};
	OrmDocument?: TDocument;
	dataSppbIn?: RouterOutput["sppb"]["in"]["get"][number];
	// dataPo?: RouterOutput["customer_po"]["get"][number];
	// docDetail?: TDocument;
	dataCreatedBy?: TUser;
	dataUpdatedBy?: TUser;
	// listMesin?: {
	// 	dataMesin?: TMesin;
	// 	instruksi: {
	// 		dataInstruksi?: TInstruksiKanban;
	// 		parameter: ((TParameter & {kategori?: TParameterKategori}) | undefined)[];
	// 		material: ((TMaterial & {kategori?: TMaterialKategori}) | undefined)[];
	// 		hardness: ((THardness & {kategori?: THardnessKategori}) | undefined)[];
	// 	}[];
	// }[];
};

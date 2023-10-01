import {FieldValues, UseFormReturn} from "react-hook-form";

import {qtyList} from "@constants";
import type {RouterOutput} from "@trpc/routers";
export type {
	AppRouter,
	AppRouterCaller,
	RouterInput,
	RouterOutput,
} from "@trpc/routers";
export type {Route} from "pages/app/scan/[route]";
export type {Context} from "server/trpc/context";
export type {
	BaseMenu,
	ItemsSppb,
	ModalType,
	ModalTypePreview,
	ModalTypeSelect,
	ScanItem,
	TableFormValue,
	TCustomer,
	TCustomerPO,
	TCustomerPOExtended,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TCustomerSPPBOutItem,
	TCustomerSPPBOutPo,
	TCustomerSPPBOutPoItems,
	TCustomerSPPBOutSppbIn,
	TCustomerSPPBOutUpsert,
	TDashboard,
	TDashboardInput,
	TDashboardTitle,
	TDashboardView,
	TDecimal,
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
	TRoute,
	TScan,
	TScanDate,
	TScanItem,
	TScanItemReject as TScanRejectItem,
	TScanNew,
	TScanNewItem,
	TScanTarget,
	TSession,
	TSupItemRelation,
	TSupplier,
	TSupplierItem,
	TSupplierItemUpsert,
	TSupplierPO,
	TSupplierPOItem,
	TSupplierPOUpsert,
	TSupplierUpsert,
	TUpsertSppbIn,
	TUser,
	TUserLogin,
	TUserSignIn,
	UnitQty,
	UnitUnit,
	USPPB,
	ZId,
	ZIds,
} from "./app.zod";

import type {
	TCustomer,
	TCustomerPO,
	TDocument,
	TKanban,
	TKanbanUpsert,
	TScan,
	TUser,
} from "./app.zod";

export type FormProps<
	T extends FieldValues,
	K extends keyof UseFormReturn<T> = "control",
> = Pick<UseFormReturn<T>, K>;

export type TDataScan = {dataKanban: RouterOutput["kanban"]["get"]} & TScan;
export type UQty = typeof qtyList[number];
export type UQtyList = `qty${UQty}`;

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

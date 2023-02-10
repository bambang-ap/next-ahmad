import {UseQueryResult} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';

import {
	TRole,
	TUser,
	TMesin,
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
} from '@appTypes/app.type';
import {InputProps, TableProps} from '@components';
import {
	useFetchRole,
	useFetchUser,
	useManageRole,
	useManageUser,
	useManageMesin,
	useFetchMesin,
	useFetchCustomer,
	useManageCustomer,
	useFetchCustomerPO,
	useManageCustomerPO,
	useFetchCustomerSPPBIn,
	useManageCustomerSPPBIn,
	useFetchCustomerSPPBOut,
	useManageCustomerSPPBOut,
} from '@queries';

type Action = 'add' | 'edit' | 'delete';

type Body<T extends Record<string, any>> = (keyof T)[];

type AllowedPages = {
	table: {header: string[]; body: Body<any>};
	queries: {useFetch: Fetch; useManage: Manage};
	modalField: Partial<Record<Action, ColUnion[]>>;
	text: {
		modal: Partial<Record<Action, string>>;
	};
};

type Fetch =
	| typeof useFetchMesin
	| typeof useFetchMesin
	| typeof useFetchCustomer
	| typeof useFetchCustomerPO
	| typeof useFetchUser
	| typeof useFetchRole;
type Manage =
	| typeof useManageMesin
	| typeof useManageMesin
	| typeof useManageCustomer
	| typeof useManageCustomerPO
	| typeof useManageCustomerSPPBIn
	| typeof useManageCustomerSPPBOut
	| typeof useManageUser
	| typeof useManageRole;

export type Types =
	| TCustomer
	| TCustomerPO
	| TCustomerSPPBIn
	| TCustomerSPPBOut
	| TMesin
	| TRole
	| TUser;

export type ColUnion = FieldForm<UnionToIntersection<Types>>;

export type FieldForm<T extends {}> = {
	col: keyof T;
	label?: string;
	editable?: boolean;
} & (
	| {type?: InputProps['type']}
	| {
			type: 'select';
			renderItem: TableProps<any>['renderItem'];
			onSelect: (item: any) => string;
			useFetch: () => UseQueryResult<AxiosResponse<unknown[], any>, unknown>;
	  }
);

export const allowedPages: Record<string, AllowedPages> = {
	'/app/mesin': {
		queries: {useFetch: useFetchMesin, useManage: useManageMesin},
		table: {
			header: ['Name', 'Nomor Mesin', 'Action'],
			get body(): Body<TMesin> {
				return ['name', 'nomor_mesin'];
			},
		},
		modalField: {
			get add(): FieldForm<TMesin>[] {
				return [{col: 'name'}, {col: 'nomor_mesin'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah mesin',
				edit: 'Ubah mesin',
				delete: 'Hapus mesin',
			},
		},
	},
	'/app/customer': {
		queries: {useFetch: useFetchCustomer, useManage: useManageCustomer},
		table: {
			header: ['Name', 'Action'],
			get body(): Body<TCustomer> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<TCustomer>[] {
				return [{col: 'name'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah customer',
				edit: 'Ubah customer',
				delete: 'Hapus customer',
			},
		},
	},
	'/app/customer/po': {
		queries: {useFetch: useFetchCustomerPO, useManage: useManageCustomerPO},
		table: {
			header: ['Name', 'ID Customer', 'Action'],
			get body(): Body<TCustomerPO> {
				return ['name', 'id_customer'];
			},
		},
		modalField: {
			get add(): FieldForm<TCustomerPO>[] {
				return [
					{col: 'name'},
					{
						col: 'id_customer',
						type: 'select',
						editable: false,
						useFetch: () => useFetchCustomer(),
						onSelect: (item: TCustomer) => item.id,
						renderItem: ({item}: MMapValue<TCustomer>) => (
							<div>{item.name}</div>
						),
					},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah customer PO',
				edit: 'Ubah customer PO',
				delete: 'Hapus customer PO',
			},
		},
	},
	'/app/customer/sppb-in': {
		queries: {
			useFetch: useFetchCustomerSPPBIn,
			useManage: useManageCustomerSPPBIn,
		},
		table: {
			header: ['Name', 'ID PO', 'Action'],
			get body(): Body<TCustomerSPPBIn> {
				return ['name', 'id_po'];
			},
		},
		modalField: {
			get add(): FieldForm<TCustomerSPPBIn>[] {
				return [
					{col: 'name'},
					{
						col: 'id_po',
						type: 'select',
						useFetch: () => useFetchCustomerPO(),
						onSelect: (item: TCustomerPO) => item.id,
						renderItem: ({item}: MMapValue<TCustomerPO>) => (
							<div>{item.id}</div>
						),
					},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah customer SPPB In',
				edit: 'Ubah customer SPPB In',
				delete: 'Hapus customer SPPB In',
			},
		},
	},
	'/app/customer/sppb-out': {
		queries: {
			useFetch: useFetchCustomerSPPBOut,
			useManage: useManageCustomerSPPBOut,
		},
		table: {
			header: ['Name', 'ID PO', 'Action'],
			get body(): Body<TCustomerSPPBOut> {
				return ['name', 'id_po'];
			},
		},
		modalField: {
			get add(): FieldForm<TCustomerSPPBOut>[] {
				return [
					{col: 'name'},
					{
						col: 'id_po',
						type: 'select',
						useFetch: () => useFetchCustomerPO(),
						onSelect: (item: TCustomerPO) => item.id,
						renderItem: ({item}: MMapValue<TCustomerPO>) => (
							<div>{item.id}</div>
						),
					},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah customer SPPB Out',
				edit: 'Ubah customer SPPB Out',
				delete: 'Hapus customer SPPB Out',
			},
		},
	},
	'/app/user': {
		queries: {useFetch: useFetchUser, useManage: useManageUser},
		table: {
			header: ['Name', 'Email', 'Role', 'Action'],
			get body(): Body<TUser> {
				return ['name', 'email', 'role'];
			},
		},
		modalField: {
			get add(): FieldForm<TUser>[] {
				return [
					{col: 'name'},
					{col: 'email'},
					{col: 'role'},
					{col: 'password'},
				];
			},
			get edit(): FieldForm<TUser>[] {
				return [{col: 'name'}, {col: 'email'}, {col: 'role'}];
			},
		},
		text: {
			modal: {
				add: 'Tambah user',
				edit: 'Ubah user',
				delete: 'Hapus user',
			},
		},
	},
	'/app/user/role': {
		queries: {useFetch: useFetchRole, useManage: useManageRole},
		table: {
			header: ['Role', 'Action'],
			get body(): Body<TRole> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<TRole>[] {
				return [{col: 'name'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah role',
				edit: 'Ubah role',
				delete: 'Hapus role',
			},
		},
	},
};

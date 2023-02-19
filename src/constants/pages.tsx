import {
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TInstruksiKanban,
	TMesin,
	TRole,
	TUser,
} from '@appTypes/app.type';
import {InputProps} from '@components';
import {CRUD_ENABLED} from '@enum';
import {
	useFetchCustomer,
	useFetchCustomerPO,
	useFetchInstruksiKanban,
	useFetchMesin,
	useFetchRole,
	useFetchUser,
	useManageCustomer,
	useManageCustomerPO,
	useManageCustomerSPPBIn,
	useManageCustomerSPPBOut,
	useManageInstruksiKanban,
	useManageMesin,
	useManageRole,
	useManageUser,
} from '@queries';

type Action = 'add' | 'edit' | 'delete';

type Body<T extends Record<string, any>> = (keyof T)[];

type AllowedPages = {
	enumName: CRUD_ENABLED;
	table: {header: string[]; body: Body<any>};
	queries: {useFetch: Fetch; useManage: Manage};
	modalField: Partial<Record<Action, ColUnion[]>>;
	text: {
		modal: Partial<Record<Action, string>>;
	};
};

type Fetch =
	| typeof useFetchMesin
	| typeof useFetchCustomer
	| typeof useFetchCustomerPO
	| typeof useFetchUser
	| typeof useFetchRole;
type Manage =
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
} & {type?: InputProps['type']};

export const allowedPages: Record<string, AllowedPages> = {
	'/app/mesin': {
		enumName: CRUD_ENABLED.MESIN,
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
	'/app/kanban/instruksi': {
		enumName: CRUD_ENABLED.INSTRUKSI_KANBAN,
		queries: {
			useFetch: useFetchInstruksiKanban,
			useManage: useManageInstruksiKanban,
		},
		table: {
			header: ['Name', 'Action'],
			get body(): Body<TInstruksiKanban> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<TInstruksiKanban>[] {
				return [{col: 'name'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah instruksi kanban',
				edit: 'Ubah instruksi kanban',
				delete: 'Hapus instruksi kanban',
			},
		},
	},
	'/app/customer': {
		enumName: CRUD_ENABLED.CUSTOMER,
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
	'/app/user': {
		enumName: CRUD_ENABLED.USER,
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
		enumName: CRUD_ENABLED.ROLE,
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

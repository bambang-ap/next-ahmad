import {
	TRole,
	TUser,
	TMesin,
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
} from '@appTypes/app.type';
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

export const allowedPages = {
	'/app/mesin': {
		queries: {useFetch: useFetchMesin, useManage: useManageMesin},
		table: {
			header: ['Name', 'Nomor Mesin', 'Action'],
		},
		modalField: {
			add: ['name', 'nomor_mesin'] as (keyof TMesin)[],
			edit: ['name', 'nomor_mesin'] as (keyof TMesin)[],
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
		},
		modalField: {
			add: ['name'] as (keyof TCustomer)[],
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
			header: ['Name', 'Action'],
		},
		modalField: {
			add: ['name'] as (keyof TCustomerPO)[],
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
		},
		modalField: {
			add: ['name', 'id_po'] as (keyof TCustomerSPPBIn)[],
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
		},
		modalField: {
			add: ['name', 'id_po'] as (keyof TCustomerSPPBOut)[],
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
		},
		modalField: {
			add: ['name', 'email', 'role', 'password'] as (keyof TUser)[],
			edit: ['name', 'email', 'role'] as (keyof TUser)[],
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
		},
		modalField: {
			add: ['name'] as (keyof TRole)[],
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

// @ts-nocheck

import {
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	THardness,
	THardnessKategori,
	TInstruksiKanban,
	TMaterial,
	TMaterialKategori,
	TMesin,
	TRole,
	TUser,
} from '@appTypes/app.type';
import {InputProps, SelectPropsData} from '@components';
import {CRUD_ENABLED} from '@enum';
import {TRPCClientErrorLike} from '@trpc/client';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {AnyProcedure} from '@trpc/server';
import {inferTransformedProcedureOutput} from '@trpc/server/shared';
import {trpc} from '@utils/trpc';

type Action = 'add' | 'edit' | 'delete';

export type BodyArrayKey<T extends Record<string, any>> = [
	keyof T,
	() => unknown,
	(item: unknown, data: unknown[]) => string,
];

export type Body<T extends Record<string, any>> = (keyof T | BodyArrayKey<T>)[];

export type AllowedPages = {
	enumName: CRUD_ENABLED;
	searchKey: string;
	table: {header: string[]; body: Body<any>};
	modalField: Partial<Record<Action, ColUnion[]>>;
	text: {
		modal: Partial<Record<Action, string>>;
	};
};

export type Types =
	| TCustomer
	| TCustomerPO
	| TCustomerSPPBIn
	| TCustomerSPPBOut
	| TMesin
	| TRole
	| TMaterial
	| TMaterialKategori
	| TUser;

export type ColUnion = FieldForm<UnionToIntersection<Types>>;

export type FieldForm<T extends {}> = {
	col: keyof T;
	label?: string;
} & (
	| {type?: InputProps['type']}
	| {
			type: 'select';
			firstOption?: string;
			dataMapping: (item: any[]) => SelectPropsData[];
			dataQuery: () => UseTRPCQueryResult<
				inferTransformedProcedureOutput<AnyProcedure>,
				TRPCClientErrorLike<AnyProcedure>
			>;
	  }
);

export const allowedPages: Record<string, AllowedPages> = {
	'/app/hardness': {
		enumName: CRUD_ENABLED.HARDNESS,
		searchKey: 'name',
		table: {
			header: ['Name', 'Kategori', 'Action'],
			get body(): Body<THardness> {
				return [
					'name',
					[
						'id_kategori',
						() =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.HARDNESS_KATEGORI}),
						(item: THardness, data: THardnessKategori[]) =>
							data?.find?.(e => e.id === item.id_kategori)?.name,
					],
				];
			},
		},
		modalField: {
			get add(): FieldForm<THardness>[] {
				return [
					{col: 'name'},
					{
						col: 'id_kategori',
						type: 'select',
						firstOption: '- Pilih Kategori -',
						dataQuery: () =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.HARDNESS_KATEGORI}),
						dataMapping: (item: THardnessKategori[]) =>
							item?.map(({id, name}) => ({value: id, label: name})),
					},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah Hardness',
				edit: 'Ubah Hardness',
				delete: 'Hapus Hardness',
			},
		},
	},

	'/app/hardness/kategori': {
		enumName: CRUD_ENABLED.HARDNESS_KATEGORI,
		searchKey: 'name',
		table: {
			header: ['Name', 'Action'],
			get body(): Body<THardnessKategori> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<THardnessKategori>[] {
				return [{col: 'name'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah Hardness kategori',
				edit: 'Ubah Hardness kategori',
				delete: 'Hapus Hardness kategori',
			},
		},
	},
	'/app/material': {
		enumName: CRUD_ENABLED.MATERIAL,
		searchKey: 'name',
		table: {
			header: ['Name', 'Kategori', 'Action'],
			get body(): Body<TMaterial> {
				return [
					'name',
					[
						'id_kategori',
						() =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.MATERIAL_KATEGORI}),
						(item: TMaterial, data: TMaterialKategori[]) =>
							data?.find?.(e => e.id === item.id_kategori)?.name,
					],
				];
			},
		},
		modalField: {
			get add(): FieldForm<TMaterial>[] {
				return [
					{col: 'name'},
					{
						col: 'id_kategori',
						type: 'select',
						firstOption: '- Pilih Kategori -',
						dataQuery: () =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.MATERIAL_KATEGORI}),
						dataMapping: (item: TMaterialKategori[]) =>
							item?.map(({id, name}) => ({value: id, label: name})),
					},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah material',
				edit: 'Ubah material',
				delete: 'Hapus material',
			},
		},
	},

	'/app/material/kategori': {
		enumName: CRUD_ENABLED.MATERIAL_KATEGORI,
		searchKey: 'name',
		table: {
			header: ['Name', 'Action'],
			get body(): Body<TMaterialKategori> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<TMaterialKategori>[] {
				return [{col: 'name'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah material kategori',
				edit: 'Ubah material kategori',
				delete: 'Hapus material kategori',
			},
		},
	},

	'/app/mesin': {
		enumName: CRUD_ENABLED.MESIN,
		searchKey: 'nomor_mesin',
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
		searchKey: 'name',
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
		searchKey: 'name',
		table: {
			header: ['name', 'alamat', 'npwp', 'no_telp', 'Up', 'Action'],
			get body(): Body<TCustomer> {
				return ['name', 'alamat', 'npwp', 'no_telp', 'up'];
			},
		},
		modalField: {
			get add(): FieldForm<TCustomer>[] {
				return [
					{col: 'name'},
					{col: 'alamat'},
					{col: 'npwp'},
					{col: 'no_telp'},
					{col: 'up'},
				];
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
		searchKey: 'name',
		table: {
			header: ['Name', 'Email', 'Role', 'Action'],
			get body(): Body<TUser> {
				return [
					'name',
					'email',
					[
						'role',
						() => trpc.basic.get.useQuery({target: CRUD_ENABLED.ROLE}),
						(item: TUser, data: TRole[]) =>
							data?.find?.(e => e.id === item.role)?.name,
					],
				];
			},
		},
		modalField: {
			get add(): FieldForm<TUser>[] {
				return [
					{col: 'name'},
					{col: 'email'},
					{
						col: 'role',
						type: 'select',
						firstOption: '- Pilih Role -',
						dataQuery: () =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.ROLE}),
						dataMapping: (item: TRole[]) =>
							item?.map(({id, name}) => ({value: id, label: name})),
					},
					{col: 'password'},
				];
			},
			get edit(): FieldForm<TUser>[] {
				const userAdd = this.add?.slice();
				userAdd?.splice(-1);
				return userAdd;
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
		searchKey: 'name',
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

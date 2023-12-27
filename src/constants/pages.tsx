// @ts-nocheck

import {
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TCustomerSPPBOut,
	TDocument,
	THardness,
	THardnessKategori,
	TInstruksiKanban,
	TKategoriMesin,
	TKendaraan,
	TMaterial,
	TMaterialKategori,
	TMesin,
	TParameter,
	TParameterKategori,
	TRole,
	TUser,
} from '@appTypes/app.type';
import {InputProps, SelectPropsData} from '@components';
import {CRUD_ENABLED} from '@enum';
import {TRPCClientErrorLike} from '@trpc/client';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {AnyProcedure} from '@trpc/server';
import {inferTransformedProcedureOutput} from '@trpc/server/shared';
import {dateUtils} from '@utils';
import {trpc} from '@utils/trpc';

type Action = 'add' | 'edit' | 'delete';

export type BodyArrayKey<T extends Record<string, any>> = [
	keyof T,
	() => unknown,
	(item: unknown, data: unknown[]) => string,
];

export type Body<T extends Record<string, any>> = (
	| keyof T
	| BodyArrayKey<T>
	| ((item: T) => string)
)[];

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
	| TKendaraan
	| TRole
	| TMaterial
	| TMaterialKategori
	| TDocument
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
	'/app/document': {
		enumName: CRUD_ENABLED.DOCUMENT,
		searchKey: 'doc_no',
		table: {
			header: [
				'Dibuat Pada',
				'Dirubah Pada',
				'Tanggal Efektif',
				'Nomor Dokumen',
				'Revisi',
				'Terbit',
				'Keterangan',
				'Action',
			],
			get body(): Body<TDocument> {
				return [
					item => dateUtils.full(item.createdAt)!,
					item => dateUtils.full(item.updatedAt)!,
					item => dateUtils.date(item.tgl_efektif)!,
					'doc_no',
					'revisi',
					'terbit',
					'keterangan',
				];
			},
		},
		modalField: {
			get add(): FieldForm<TDocument>[] {
				return [
					{col: 'doc_no', label: 'Document Number'},
					{col: 'tgl_efektif', label: 'Document Number', type: 'date'},
					{col: 'keterangan', label: 'Keterangan'},
					{col: 'revisi', label: 'Revisi'},
					{col: 'terbit', label: 'Terbit'},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah Document',
				edit: 'Ubah Document',
				delete: 'Hapus Document',
			},
		},
	},

	'/app/hardness': {
		enumName: CRUD_ENABLED.HARDNESS,
		searchKey: 'name',
		table: {
			header: ['Kategori', 'Name', 'Keterangan', 'Action'],
			get body(): Body<THardness> {
				return [
					[
						'id_kategori',
						() =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.HARDNESS_KATEGORI}),
						(item: THardness, data: THardnessKategori[]) =>
							data?.find?.(e => e.id === item.id_kategori)?.name,
					],
					'name',
					'keterangan',
				];
			},
		},
		modalField: {
			get add(): FieldForm<THardness>[] {
				return [
					{
						col: 'id_kategori',
						label: 'Pilih Kategori',
						type: 'select',
						firstOption: '- Pilih Kategori -',
						dataQuery: () =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.HARDNESS_KATEGORI}),
						dataMapping: (item: THardnessKategori[]) =>
							item?.map(({id, name}) => ({value: id, label: name})),
					},
					{col: 'name', label: 'Nama'},
					{col: 'keterangan', label: 'Keterangan'},
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
				return [{col: 'name', label: 'Kategori'}];
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
			header: ['Kategori', 'Name', 'Action'],
			get body(): Body<TMaterial> {
				return [
					[
						'id_kategori',
						() =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.MATERIAL_KATEGORI}),
						(item: TMaterial, data: TMaterialKategori[]) =>
							data?.find?.(e => e.id === item.id_kategori)?.name,
					],
					'name',
				];
			},
		},
		modalField: {
			get add(): FieldForm<TMaterial>[] {
				return [
					{
						col: 'id_kategori',
						label: 'Kategori',
						type: 'select',
						firstOption: '- Pilih Kategori -',
						dataQuery: () =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.MATERIAL_KATEGORI}),
						dataMapping: (item: TMaterialKategori[]) =>
							item?.map(({id, name}) => ({value: id, label: name})),
					},
					{col: 'name', label: 'Nama'},
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
				return [{col: 'name', label: 'Kategori'}];
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

	'/app/parameter': {
		enumName: CRUD_ENABLED.PARAMETER,
		searchKey: 'name',
		table: {
			header: ['Kategori', 'Name', 'Keterangan', 'Action'],
			get body(): Body<TParameter> {
				return [
					[
						'id_kategori',
						() =>
							trpc.basic.get.useQuery({
								target: CRUD_ENABLED.PARAMETER_KATEGORI,
							}),
						(item: TParameter, data: TParameterKategori[]) =>
							data?.find?.(e => e.id === item.id_kategori)?.name,
					],
					'name',
					'keterangan',
				];
			},
		},
		modalField: {
			get add(): FieldForm<TParameter>[] {
				return [
					{
						col: 'id_kategori',
						label: 'Pilih Kategori',
						type: 'select',
						firstOption: '- Pilih Kategori -',
						dataQuery: () =>
							trpc.basic.get.useQuery({
								target: CRUD_ENABLED.PARAMETER_KATEGORI,
							}),
						dataMapping: (item: TParameterKategori[]) =>
							item?.map(({id, name}) => ({value: id, label: name})),
					},
					{col: 'name', label: 'Nama'},
					{col: 'keterangan', label: 'Keterangan'},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah Parameter',
				edit: 'Ubah Parameter',
				delete: 'Hapus Parameter',
			},
		},
	},

	'/app/parameter/kategori': {
		enumName: CRUD_ENABLED.PARAMETER_KATEGORI,
		searchKey: 'name',
		table: {
			header: ['Name', 'Action'],
			get body(): Body<TParameterKategori> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<TParameterKategori>[] {
				return [{col: 'name', label: 'Kategori'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah Parameter kategori',
				edit: 'Ubah Parameter kategori',
				delete: 'Hapus Parameter kategori',
			},
		},
	},

	'/app/mesin': {
		enumName: CRUD_ENABLED.MESIN,
		searchKey: 'nomor_mesin',
		table: {
			header: ['Name', 'Nomor Mesin', 'Action'],
			get body(): Body<TMesin> {
				return [
					[
						'kategori_mesin',
						() =>
							trpc.basic.get.useQuery({
								target: CRUD_ENABLED.MESIN_KATEGORI,
							}),
						(item: TMesin, data: TKategoriMesin[]) =>
							data?.find?.(e => e.id === item.kategori_mesin)?.name,
					],
					'nomor_mesin',
				];
			},
		},
		modalField: {
			get add(): FieldForm<TMesin>[] {
				return [
					{
						col: 'kategori_mesin',
						label: 'Pilih Nama',
						type: 'select',
						firstOption: '- Pilih Nama -',
						dataQuery: () =>
							trpc.basic.get.useQuery({
								target: CRUD_ENABLED.MESIN_KATEGORI,
							}),
						dataMapping: (item: TKategoriMesin[]) =>
							item?.map(({id, name}) => ({value: id, label: name})),
					},
					{col: 'nomor_mesin', label: 'Nomor Mesin'},
				];
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

	'/app/mesin/kategori': {
		enumName: CRUD_ENABLED.MESIN_KATEGORI,
		searchKey: 'name',
		table: {
			header: ['Name', 'Action'],
			get body(): Body<TMaterialKategori> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<TMaterialKategori>[] {
				return [{col: 'name', label: 'Nama Mesin'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah Nama Mesin',
				edit: 'Ubah Nama Mesin',
				delete: 'Hapus Nama Mesin',
			},
		},
	},

	'/app/kendaraan': {
		enumName: CRUD_ENABLED.KENDARAAN,
		searchKey: 'name',
		table: {
			header: ['Name', 'Action'],
			get body(): Body<TKendaraan> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<TKendaraan>[] {
				return [{col: 'name', label: 'Nama Kendaraan'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah kendaraan',
				edit: 'Ubah kendaraan',
				delete: 'Hapus kendaraan',
			},
		},
	},

	'/app/kanban/instruksi': {
		enumName: CRUD_ENABLED.INSTRUKSI_KANBAN,
		searchKey: 'name',
		table: {
			header: ['Proses', 'Action'],
			get body(): Body<TInstruksiKanban> {
				return ['name'];
			},
		},
		modalField: {
			get add(): FieldForm<TInstruksiKanban>[] {
				return [{col: 'name', label: 'Proses'}];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah proses kanban',
				edit: 'Ubah proses kanban',
				delete: 'Hapus proses kanban',
			},
		},
	},

	'/app/customer': {
		enumName: CRUD_ENABLED.CUSTOMER,
		searchKey: 'name',
		table: {
			header: [
				'Customer',
				'Alamat',
				'NPWP',
				'No. Telepon',
				'UP',
				'Action',
				'',
				'',
				'',
				'',
				'',
			],
			get body(): Body<TCustomer> {
				return ['name', 'alamat', 'npwp', 'no_telp', 'up'];
			},
		},
		modalField: {
			get add(): FieldForm<TCustomer>[] {
				return [
					{col: 'name', label: 'Customer'},
					{col: 'alamat', label: 'Alamat'},
					{col: 'npwp', label: 'NPWP'},
					{col: 'no_telp', label: 'No. Telepon'},
					{col: 'up', label: 'UP'},
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
					{col: 'name', label: 'Name'},
					{col: 'email', label: 'Email'},
					{
						col: 'role',
						label: 'Role',
						type: 'select',
						firstOption: '- Pilih Role -',
						dataQuery: () =>
							trpc.basic.get.useQuery({target: CRUD_ENABLED.ROLE}),
						dataMapping: (item: TRole[]) =>
							item?.map(({id, name}) => ({value: id, label: name})),
					},
					{col: 'password', label: 'Password', type: 'password'},
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
				return [{col: 'name', label: 'Role'}];
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

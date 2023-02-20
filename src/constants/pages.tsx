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
import {InputProps, SelectPropsData} from '@components';
import {CRUD_ENABLED} from '@enum';
import {TRPCClientErrorLike} from '@trpc/client';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {AnyProcedure} from '@trpc/server';
import {inferTransformedProcedureOutput} from '@trpc/server/shared';
import {trpc} from '@utils/trpc';

type Action = 'add' | 'edit' | 'delete';

type Body<T extends Record<string, any>> = (keyof T)[];

export type AllowedPages = {
	enumName: CRUD_ENABLED;
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
	'/app/customer/customer_sppb_in': {
		enumName: CRUD_ENABLED.CUSTOMER_SPPB_IN,
		table: {
			header: ['Name', 'Nomor PO', 'Action'],
			get body(): Body<TCustomerSPPBIn> {
				return ['name', 'nomor_po'];
			},
		},
		modalField: {
			get add(): FieldForm<TCustomerSPPBIn>[] {
				return [
					{col: 'name'},
					{
						col: 'nomor_po',
						type: 'select',
						firstOption: '- Pilih PO -',
						dataQuery: () =>
							trpc.customer_po_get.useQuery({type: 'forSelection'}),
						dataMapping: (item: TCustomerPO[]) =>
							item?.map(({nomor_po}) => ({value: nomor_po})),
					},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah SPPB In',
				edit: 'Ubah SPPB In',
				delete: 'Hapus SPPB In',
			},
		},
	},

	'/app/customer/customer_sppb_out': {
		enumName: CRUD_ENABLED.CUSTOMER_SPPB_OUT,
		table: {
			header: ['Name', 'Nomor PO', 'Action'],
			get body(): Body<TCustomerSPPBOut> {
				return ['name', 'nomor_po'];
			},
		},
		modalField: {
			get add(): FieldForm<TCustomerSPPBOut>[] {
				return [
					{col: 'name'},
					{
						col: 'nomor_po',
						type: 'select',
						firstOption: '- Pilih PO -',
						dataQuery: () =>
							trpc.customer_po_get.useQuery({type: 'forSelection'}),
						dataMapping: (item: TCustomerPO[]) =>
							item?.map(({nomor_po}) => ({value: nomor_po})),
					},
				];
			},
			get edit() {
				return this.add;
			},
		},
		text: {
			modal: {
				add: 'Tambah SPPB Out',
				edit: 'Ubah SPPB Out',
				delete: 'Hapus SPPB Out',
			},
		},
	},

	'/app/mesin': {
		enumName: CRUD_ENABLED.MESIN,
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

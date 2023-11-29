import {Breakpoint, TextFieldProps} from '@mui/material';
import {QueryObserverOptions} from '@tanstack/react-query';
import type {OrderItem} from 'sequelize';
import {z} from 'zod';

import {
	AppRouter,
	PaperSize,
	TDashboardView,
	TItemUnit,
	TMasterItem,
	TScanTarget,
} from '@appTypes/app.type';
import {TItemUnitInternal} from '@appTypes/app.zod';
import {SelectPropsData} from '@components';
import {REQ_FORM_STATUS} from '@enum';
import {TRPCClientError} from '@trpc/client';

export * from './colors';
export * from './pages';
export * from './sizes';

export const ppnPercentage = 11 as const;
export const ppnMultiply = ppnPercentage * 0.01;

export const gap = 'gap-0.5';
export const padding = 'p-0.5';

export const IMIConst = {
	title: 'Inventory PT. IMI',

	shortName: 'IMI',
	name: 'PT. INDOHEAT METAL INTI',
	address1: 'Jl. Desa Anggadita, Kec. Klari',
	address2: 'Karawang, Jawa Barat 41371',
	phone: '(0267) 432168',
	fax: '(0267) 432268',
	email: 'indoheatt@yahoo.co.id',
} as const;

export const unitData: TItemUnit[] = [
	'pcs',
	'drum',
	'kg',
	'box',
	'set',
	'carton',
	'pallet',
];
export const selectUnitData: SelectPropsData<TItemUnit>[] = unitData.map(
	value => ({value}),
);

export const selectReqStatus: SelectPropsData<REQ_FORM_STATUS>[] = [
	{value: REQ_FORM_STATUS.req},
	{value: REQ_FORM_STATUS.proc},
	{value: REQ_FORM_STATUS.close},
];

export const unitDataInternal: TItemUnitInternal[] = [
	...unitData,
	'lembar',
	'liter',
	'tabung',
];
export const selectUnitDataInternal: SelectPropsData<TItemUnitInternal>[] =
	unitDataInternal.map(value => ({value}));

export const dataPerPageSelection: SelectPropsData<number>[] = [
	{value: 5},
	{value: 10},
	{value: 20},
	{value: 30},
	{value: 50},
];

export const Success = {message: 'Success'};

export const isProd = process.env.NODE_ENV === 'production';

export const defaultLimit = 10;
export const qtyList = [1, 2, 3] as const;

export const SidebarCollapseOn: Breakpoint = 'sm';

export const ScanTarget: TScanTarget[] = ['produksi', 'qc', 'finish_good'];

export const paperA4: PaperSize = [210, 297];
export const paperLpb: PaperSize = [161, 212];
export const paperF4: PaperSize = [214.884, 329.946];
export const paperCont: PaperSize = [241.3, 279.4];

export const DashboardSelectView: SelectPropsData<TDashboardView>[] = [
	{value: 'total', label: 'Total Records'},
	{value: 'main', label: 'Dashboard Utama'},
	{value: 'bar', label: 'Business Process'},
	{value: 'machine', label: 'Dashboard Mesin Produksi'},
];

export const cuttingLineClassName =
	'border border-gray-500 border-dashed border-l-0 border-t-0';

export const focusInputClassName =
	'border-2 border-transparent focus-within:border-app-secondary-03';

export const inputClassName = 'px-2 py-1 rounded bg-white';

export const defaultExcludeColumn = []; // ['createdAt', 'updatedAt'];
export const defaultExcludeColumns = ['createdAt', 'updatedAt'];
export const defaultOrderBy = {order: [['createdAt', 'desc'] as OrderItem]};

export const formatDate = 'YYYY-MM-DD';
export const formatHour = 'HH:mm:ss';
export const formatFull = `${formatDate} - ${formatHour}`;

export const formatDateView = 'DD/MM/YYYY';
export const formatDateStringView = 'D MMMM YYYY';
export const formatFullView = `${formatDateView} - ${formatHour}`;

export const decimalValue = 2;
export const decimalRegex = new RegExp(
	`^(0|[1-9]\\d*)(\\.\\d{1,${decimalValue}})?$`,
);
export const decimalSchema = z.string().regex(decimalRegex); //.transform(Number);

export const defaultInstruksi: TMasterItem['instruksi'][string][number] = {
	hardness: [''],
	id_instruksi: '',
	material: [''],
	parameter: [''],
	hardnessKategori: [''],
	parameterKategori: [''],
	materialKategori: [''],
};

export const defaultTextFieldProps: TextFieldProps = {
	InputLabelProps: {shrink: true, sx: {paddingBottom: 1}},
	variant: 'outlined',
};

export const defaultErrorMutation: {onError: any} = {
	onError: (err: TRPCClientError<AppRouter>) => {
		try {
			JSON.parse(err?.message);
			alert(
				'Mohon periksa kembali data yang Anda isi atau kolom yang belum terisi',
			);
		} catch (e) {
			alert(err?.message);
		}
	},
};

export const queryClientConfig: QueryObserverOptions = {
	refetchIntervalInBackground: false,
	refetchOnMount: true,
	refetchOnWindowFocus: true,
	refetchInterval: 1000 * 5 * 60,
	retry: 1,
};

export const nonRequiredRefetch: any = {
	refetchOnMount: false,
	refetchOnWindowFocus: false,
	refetchOnReconnect: false,
} as QueryObserverOptions;

export const through = {attributes: []};

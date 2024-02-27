import {Breakpoint, TextFieldProps} from '@mui/material';
import {QueryObserverOptions} from '@tanstack/react-query';
import {ApexOptions} from 'apexcharts';
import type {OrderItem} from 'sequelize';
import {z} from 'zod';

import {
	AppRouter,
	PaperSize,
	TDashboardView,
	TItemUnit,
	TMasterItem,
	TScanTarget,
	UQty,
} from '@appTypes/app.type';
import {TItemUnitInternal} from '@appTypes/app.zod';
import {SelectPropsData} from '@components';
import {IndexNumber, REQ_FORM_STATUS} from '@enum';
import {TRPCClientError} from '@trpc/client';
import {numberFormatIsRound} from '@utils';

export * from './colors';
export * from './pages';
export * from './regexes';
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
	'kg',
	'drum',
	'box',
	'set',
	'carton',
	'pallet',
];

export const allowedUnit: TItemUnit[] = [
	'pcs',
	'kg',
	// 'drum',
	// 'box',
	// 'set',
	// 'carton',
	// 'pallet',
];

export const selectionIndex: SelectPropsData<IndexNumber>[] = Object.values(
	IndexNumber,
).map(value => ({value}));

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
	'unit',
	'pasang',
	'meter',
	'roll',
	'batang',
	'lusin',
	'pail',
	'galon',
	'pack',
	'kaleng',
	'gram',
	'rim',
	'lbc',
	'sak',
	'dus',
	'colt',
	'paket',
	'botol',
	'lot',
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
export const qtyIndex = [0, 1, 2] as const;

export const SidebarCollapseOn: Breakpoint = 'sm';

export const ScanTarget: TScanTarget[] = ['produksi', 'qc', 'finish_good'];

export const paperA4: PaperSize = [210, 297];
export const paperLpb: PaperSize = [161, 212];
export const paperF4: PaperSize = [214.884, 329.946];
export const paperLPB: PaperSize = [140, 210];
export const paperCont: PaperSize = [216, 279.4];
// export const paperCont: PaperSize = [241.3, 279.4];
// export const paperCont: PaperSize = [220, 270];

export const DashboardSelectView: SelectPropsData<TDashboardView>[] = [
	{value: 'total', label: 'Total Records'},
	{value: 'main', label: 'Utama'},
	{value: 'bar', label: 'Business Process'},
	{value: 'machine', label: 'Mesin Produksi'},
	{value: 'machine_chart', label: 'Monthly Mesin'},
	{value: 'machine_daily', label: 'Daily Mesin'},
];

export const BtnGroupQty: SelectPropsData<UQty>[] = [
	{value: 1, label: 'Qty 1 - Global'},
	{value: 2, label: 'Qty 2 - Pcs'},
	{value: 3, label: 'Qty 3 - Kg'},
];

export const cuttingLineClassName =
	'border border-gray-500 border-dashed border-l-0 border-t-0';
export const cuttingLineClassName2 = `${cuttingLineClassName} border-b-0`;

export const focusInputClassName =
	'border-2 border-transparent focus-within:border-app-secondary-03';

export const inputClassName = 'px-2 py-1 rounded bg-white';

export const defaultExcludeColumn = []; // ['createdAt', 'updatedAt'];
export const defaultExcludeColumns = ['createdAt', 'updatedAt'];
export const defaultOrderBy = {order: [['createdAt', 'desc'] as OrderItem]};

export const formatDate = 'YYYY-MM-DD' as const;
export const formatHour = 'HH:mm:ss' as const;
export const formatFull = `${formatDate} - ${formatHour}` as const;
export const formatAll = `${formatDate} HH:mm:ss.SSS` as const;

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
	refetchInterval: 1000 * 60 * 60,
} as QueryObserverOptions;

export const through = {attributes: []};

export const poScoreAlpha = {
	A: 3,
	B: 6,
	C: 9,
	D: 15,
	E: Infinity,
} as const;

/**
 * TODO: create utils to calculate average on po
 * @example avg score is 84, there is no index founded on constant value
 * so, it's must bu lte from existing values
 */
export const SJ_IN_POINT = [
	100, 95, 90, 89, 85, 80, 79, 75, 70, 69, 65, 60, 57, 53, 50, 49, 45, 40, 35,
	30, 25, 20, 15, 10, 5, 0,
];

export function chartOpts(
	categories: ApexXAxis['categories'],
	opts?: Partial<
		Record<
			'hideZero' | 'horizontal' | 'dataLabel' | 'currency' | 'isFetching',
			boolean
		>
	>,
) {
	const {
		hideZero,
		horizontal,
		dataLabel = false,
		currency = false,
		isFetching,
	} = opts ?? {};
	const fontFamily = 'Bahnschrift';
	const fontSize = '16px';
	const colors = ['black'];

	const isLoading = isFetching === undefined ? false : isFetching;

	const noData = !isLoading
		? undefined
		: {
				noData: {
					text: 'Harap tunggu...',
					align: 'center',
					verticalAlign: 'middle',
					offsetX: 0,
					offsetY: 0,
					style: {
						color: '#000000',
						fontSize: '14px',
						fontFamily: 'Helvetica',
					},
				} as ApexOptions['noData'],
		  };

	return {
		fontFamily,
		fontSize,
		colors,
		opt: {
			...noData,
			plotOptions: {bar: {horizontal}},
			stroke: {curve: 'smooth'},
			markers: {size: 2},
			grid: {
				show: true,
				borderColor: '#90A4AE',
				strokeDashArray: 0,
				position: 'back',
				xaxis: {lines: {show: true}},
				yaxis: {lines: {show: true}},
				row: {colors: undefined, opacity: 0.5},
				column: {colors: undefined, opacity: 0.5},
				padding: {
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
				},
			},
			legend: {fontFamily, fontSize},
			yaxis: {
				labels: {
					style: {fontFamily, fontSize},
					formatter(val) {
						const value = numberFormatIsRound(val, currency);
						if (horizontal) return val;
						return value;
					},
				},
			},
			xaxis: {
				categories: isLoading ? undefined : categories,
				labels: {
					style: {colors, fontFamily, fontSize},
					formatter(val) {
						const value = numberFormatIsRound(parseFloat(val), currency);
						if (!horizontal) return val;
						return value;
					},
				},
			},
			dataLabels: {
				enabled: dataLabel,
				style: {colors, fontFamily, fontSize},
				background: {enabled: false},
				dropShadow: {
					enabled: true,
					top: 1,
					left: 1,
					blur: 1,
					color: 'white',
					opacity: 1,
				},
				formatter(val) {
					const value = numberFormatIsRound(val as number, currency);
					if (hideZero && val == 0) return '';
					return value;
				},
			},
		} as ApexOptions,
	};
}

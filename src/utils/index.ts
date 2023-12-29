import {ReactNode} from 'react';

import classnames from 'clsx';
import jsPDF from 'jspdf';
import clone from 'just-clone';
import * as momentTz from 'moment-timezone';
import objectPath from 'object-path';
import {DeepPartialSkipArrayKey, FieldPath, FieldValues} from 'react-hook-form';
import * as XLSX from 'xlsx';

import {GenPdfOpts, Route, RouterOutput, UnitQty} from '@appTypes/app.type';
import {
	ModalTypeSelect,
	TIndex,
	TScanItem,
	TScanTarget,
	ZIndex,
} from '@appTypes/app.zod';
import {
	decimalSchema,
	decimalValue,
	defaultErrorMutation,
	formatAll,
	formatDate,
	formatDateStringView,
	formatDateView,
	formatFullView,
	formatHour,
	paperA4,
	poScoreAlpha,
	ppnMultiply,
	qtyList,
	regPrefix,
} from '@constants';
import {getPoScore, getPOSppbOutAttributes} from '@database';
import {PO_SCORE_STATUS, REJECT_REASON, USER_ROLE} from '@enum';
import {Fields, useLoader} from '@hooks';
import {
	UseTRPCMutationOptions,
	UseTRPCQueryResult,
} from '@trpc/react-query/shared';
import {calibri_normal} from '@utils/js-fonts';

type Qty = typeof qtyList[number];

let typingTimer: NodeJS.Timeout;

momentTz.tz.setDefault('Asia/Jakarta');

function convertDate(format: string, date?: LiteralUnion<'now'> | number) {
	const isNow = date === 'now';

	if (!isNow && !date) return null;

	return moment(isNow ? undefined : date).format(format);
}

export const dateUtils = {
	date: (date?: LiteralUnion<'now'> | number) =>
		convertDate(formatDateView, date),
	readable: (date?: LiteralUnion<'now'> | number) =>
		convertDate(formatDate, date),
	hour: (date?: LiteralUnion<'now'> | number) => convertDate(formatHour, date),
	dateS: (date?: LiteralUnion<'now'> | number) =>
		convertDate(formatDateStringView, date),
	full: (date?: LiteralUnion<'now'> | number) =>
		convertDate(formatFullView, date),
	all: (date?: LiteralUnion<'now'> | number) => convertDate(formatAll, date),

	getMonths(selectedDate: string | momentTz.Moment) {
		const months = Array.from({length: 12}).map((_, i) => {
			const currentMonth = moment(selectedDate).startOf('year').add(i, 'month');

			return {month: currentMonth.format('MMMM'), currentMonth};
		});

		return months;
	},
	getDays(selectedDate: string | momentTz.Moment) {
		const daysSelectedDate = moment(selectedDate);

		const days = Array.from({
			length: daysSelectedDate.endOf('month').get('dates'),
		}).map((_, i) => {
			const currentMonth = daysSelectedDate.startOf('month').add(i, 'day');

			return currentMonth.format(formatDate);
		});

		return days;
	},
};

export {default as twColors} from 'tailwindcss/colors';

export const moment = momentTz.default;
export const classNames = classnames;

export function calculatePOScore(
	params: Awaited<ReturnType<typeof getPoScore>>,
) {
	const poItemsDays = params ?? [];
	const days = poItemsDays.reduce<number[]>((ret, cur) => {
		const {NONE, UN_PROC} = PO_SCORE_STATUS;
		cur.forEach(item => {
			if (![NONE, UN_PROC].includes(item.status)) ret.push(item.days!);
		});
		return ret;
	}, []);

	if (days.length > 0) {
		const day = Math.max(...days);

		for (const [key, value] of entries(poScoreAlpha)) {
			if (day <= value) return key;
		}
	}

	return 'N/A' as const;
}

export function typingCallback(callback: () => void, timeout = 500) {
	clearTimeout(typingTimer);
	typingTimer = setTimeout(callback, timeout);
}

export function decimalParser(value: number | string) {
	const strValue = value
		.toString()
		.replace(/[^0-9.]/g, '')
		.replace(/(?<=\..*)\./g, '');

	return {parsed: decimalSchema.safeParse(strValue), strValue};
}

export function maxRules(val: number) {
	return {max: {value: val, message: `max is ${val}`}};
}

export function numberFormat<C extends true>(
	qty: number,
	currency?: C,
	minFractionDigits?: number,
	maxFractionDigits?: number,
): string;
export function numberFormat<C extends false>(
	qty: number,
	currency?: C,
	minFractionDigits?: number,
	maxFractionDigits?: number,
): string;
export function numberFormat<C extends boolean>(
	qty: number,
	currency?: C,
	minFractionDigits?: number,
	maxFractionDigits?: number,
): string;
export function numberFormat(
	qty: number,
	currency = true,
	minimumFractionDigits = 0,
	maximumFractionDigits = 0,
) {
	const formatted = new Intl.NumberFormat('id-ID', {
		minimumFractionDigits,
		maximumFractionDigits,
		...(currency ? {style: 'currency', currency: 'IDR'} : {}),
	}).format(qty);

	return formatted;
}

export function numberFormatIsRound(
	qty: number,
	currency = true,
	minimumFractionDigits = decimalValue,
	maximumFractionDigits = decimalValue,
) {
	if (qty % 1 === 0) return numberFormat(qty, currency);
	return numberFormat(
		qty,
		currency,
		minimumFractionDigits,
		maximumFractionDigits,
	);
}

export function ppnParser(ppn: boolean, price: number, qty = 1) {
	return ppn ? price * qty * ppnMultiply : 0;
}

export function isClosedParser(poData: RouterOutput['sppb']['out']['getPO']) {
	return poData.map(po => {
		const uu = po.dSJIns?.map(bin => {
			const dd = bin.dInItems?.map(item => {
				const {itemInScan, rejectedItems} = itemInScanParser(
					item.id,
					bin?.dKanbans,
				);
				const currentQty = itemSppbOut(item.dOutItems);

				const compare = qtyMap(({qtyKey}) => {
					return currentQty?.[qtyKey] == (itemInScan?.[qtyKey] ?? 0);
				});

				return {
					...item,
					itemInScan,
					currentQty,
					rejectedItems,
					isClosed: !compare.includes(false),
				};
			});
			return {
				...bin,
				dInItems: dd,
				isClosed: !dd?.map(e => e.isClosed).includes(false),
			};
		});

		return {
			...po,
			dSJIns: uu,
			isClosed: !uu?.map(e => e.isClosed).includes(false),
		};
	});
}

export function itemInScanParser(
	idItemSppbIn: string,
	kanbans?: ReturnType<typeof getPOSppbOutAttributes>['RetKanban'][],
) {
	let rejItems: RejItems = {};
	type RejItems = Partial<Record<REJECT_REASON, UnitQty>>;

	const itemInScan = qtyReduce((ret, {qtyKey}) => {
		kanbans?.forEach(knb => {
			knb.dScans.forEach(scan => {
				scan.dScanItems.forEach(scnItem => {
					if (idItemSppbIn === knb.dKnbItems?.[0]?.id_item) {
						ret[qtyKey] += parseFloat(scnItem?.[qtyKey]?.toString() ?? '0');
					}
				});

				scan.rejScan?.dScanItems.forEach(sRItem => {
					sRItem.dRejItems.forEach(({reason, ...rItem}) => {
						if (!rejItems[reason]) rejItems[reason] = {} as UnitQty;
						if (!rejItems[reason]![qtyKey]) rejItems[reason]![qtyKey] = 0;

						rejItems[reason]![qtyKey] += parseFloat(
							rItem[qtyKey]?.toString() ?? '0',
						);
					});
				});
			});
		});

		return ret;
	});

	return {itemInScan, rejectedItems: rejItems};
}

export function itemSppbOut(
	outItems?: RouterOutput['sppb']['out']['getPO'][number]['dSJIns'][number]['dInItems'][number]['dOutItems'],
) {
	return qtyReduce((ret, {qtyKey: num}) => {
		outItems?.forEach(itm => {
			ret[num] += itm[num]!;
		});
		return ret;
	});
}

export type V = {
	qtyKey: `qty${Qty}`;
	unitKey: `unit${Qty}`;
	num: Qty;
};

export function generateId(id?: string) {
	const now = moment();
	return classNames(id, now.format('YY MM DD'), uuid().slice(-4)).replace(
		/\s/g,
		'',
	);
}

export function qtyReduce(
	callback: (ret: UnitQty, value: V, index: number) => UnitQty,
) {
	return qtyList.reduce<UnitQty>(
		(ret, num, i) => {
			const qtyKey = `qty${num}` as const;
			const unitKey = `unit${num}` as const;
			return callback(ret, {qtyKey, unitKey, num}, i);
		},
		{qty1: 0, qty2: 0, qty3: 0},
	);
}

export function qtyMap<T = ReactNode>(
	callback: (value: V, index: number) => T,
	filtered?: boolean,
) {
	const result = qtyList.map((num, i) => {
		const qtyKey = `qty${num}` as const;
		const unitKey = `unit${num}` as const;
		return callback({qtyKey, unitKey, num}, i);
	});

	if (filtered) return result.filter(Boolean);

	return result;
}

export function scanMapperByStatus(
	target: TScanTarget,
): [
	jumlah?: string,
	jumlahNext?: string,
	submitText?: string,
	form?: string,
	cardName?: string,
] {
	switch (target) {
		case 'produksi':
			return [
				'Jumlah Planning',
				'Jumlah Produksi',
				'Send to QC',
				'PROD',
				'KARTU PRODUKSI',
			];
		case 'qc':
			return [
				'Jumlah Produksi',
				'Jumlah QC',
				'Send to Finish Good',
				'QC',
				'KARTU BARANG OK',
			];
		case 'finish_good':
			return ['Jumlah QC', 'Jumlah FG', 'Diterima', 'FG', 'KARTU BARANG OK'];
		default:
			return [];
	}
}

export function prevDataScan(target: TScanTarget, data: TScanItem) {
	switch (target) {
		case 'qc':
			return {data: data.item_produksi, reject: data.item_qc_reject};
		case 'finish_good':
			return {data: data.item_qc, reject: null};
		default:
			return {data: null, reject: null};
	}
}

export function copyToClipboard(str: string) {
	const el = document.createElement('textarea');
	el.value = str;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
	alert('Token copied');
}

export function scanRouterParser(route: Route['route'], isRejected?: boolean) {
	const isProduksi = route === 'produksi';
	const isQC = route === 'qc';
	const isFG = route === 'finish_good';

	const title = isProduksi
		? 'Produksi'
		: isQC
		? 'QC'
		: isFG
		? 'Finish Good'
		: '';

	return {
		isQC,
		isFG,
		title,
		isProduksi,
		colSpan: !isProduksi ? 5 : 4,
		width: !isProduksi ? '20%' : '25%',
		rejectTitle: isRejected
			? 'Alasan reject'
			: isQC
			? 'Silahkan sertakan alasan jika Anda ingin menolaknya.'
			: '',
	};
}

export function atLeastOneDefined(
	obj: Record<string | number | symbol, unknown>,
) {
	return Object.values(obj).some(v => v !== undefined);
}

export function modalTypeParser(type?: ModalTypeSelect, pageName = '') {
	const isAdd = type === 'add';
	const isEdit = type === 'edit';
	const isPreview = type === 'preview';
	const isDelete = type === 'delete';
	const isSelect = type === 'select';
	const isOther = type === 'other';
	const isPreviewEdit = isEdit || isPreview;
	const isAddEdit = isEdit || isAdd;

	return {
		isEdit,
		isPreview,
		isAdd,
		isOther,
		isDelete,
		isSelect,
		isPreviewEdit,
		isAddEdit,
		get modalTitle() {
			switch (type) {
				case 'add':
					return `Tambah ${pageName}`;
				case 'edit':
					return `Ubah ${pageName}`;
				case 'preview':
					return `Detail ${pageName}`;
				case 'delete':
					return `Hapus ${pageName}`;
				default:
					return '';
			}
		},
	};
}

export function toBase64(
	file: File,
	callback: (result: string | null) => void,
) {
	const reader = new FileReader();

	reader.readAsDataURL(file);
	reader.onload = function () {
		if (typeof reader?.result === 'string') callback(reader.result);

		callback(null);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	reader.onerror = function (_error) {
		callback(null);
	};
}

export async function generatePDF(ids: string[], options?: GenPdfOpts) {
	const {
		filename = 'a4',
		orientation = 'p',
		paperSize = paperA4,
		properties,
		font = calibri_normal,
	} = options ?? {};

	const isPortrait = orientation === 'p' || orientation === 'portrait';

	let doc = new jsPDF({unit: 'mm', orientation, format: paperSize});

	if (!!properties) doc.setProperties(properties);

	doc.addFileToVFS(font.filename, font.font);
	doc.addFont(font.filename, font.id, font.fontStyle);

	const pageHeight = doc.internal.pageSize.getHeight();
	const elements = ids.map(id => document.getElementById(id)).filter(Boolean);
	const scaleWidth = isPortrait ? paperSize[0] : paperSize[1];

	for (let index = 0; index < elements.length; index++) {
		const element = elements[index];
		if (index + 1 < elements.length) doc.addPage(paperSize, orientation);
		doc = await htmlPage(doc, element!, index);
	}

	return doc.save(filename, {returnPromise: true});

	function htmlPage(pdf: jsPDF, element: HTMLElement, i: number) {
		const width = element.clientWidth;

		pdf.setFont(font.id);
		return new Promise<jsPDF>(resolve => {
			const newElement = `
				<style>
					* {
						font-family: ${font.id}, sans-serif !important;
					}
				</style>
				${element.outerHTML}
			`;

			pdf.html(newElement, {
				x: 0,
				margin: 0,
				y: i * pageHeight,
				html2canvas: {width, scale: scaleWidth / width},
				callback(pdfCallback) {
					resolve(pdfCallback);
				},
			});
		});
	}
}

export function paperSizeCalculator(
	width: number,
	options?: Omit<GenPdfOpts, 'filename'> & {minus?: number},
): [width: number, height: number] {
	const {orientation = 'p', minus = 45, paperSize = paperA4} = options ?? {};
	const [a, b] = paperSize;
	const isPortrait = orientation === 'p' || orientation === 'portrait';
	const scale = isPortrait ? a / b : b / a;
	const height = width / scale;

	return [width, height - minus];
}

export function exportData<T extends object>(
	data?: T[],
	names?: [filename?: string, sheetName?: string],
	header?: ObjKeyof<T>[],
) {
	if (!data) return;

	const [filename = 'data', sheetName = 'Sheet 1'] = names ?? [];

	const workbook = XLSX.utils.book_new();
	workbook.SheetNames.push(sheetName);
	workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(data, {header});
	XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function importData<T extends object>(file?: File) {
	return new Promise<T[] | undefined>(resolve => {
		if (!file) return resolve(undefined);

		const fileReader = new FileReader();
		fileReader.onload = event => {
			const data = event.target?.result;

			const workbook = XLSX.read(data, {type: 'binary'});

			Object.values(workbook.Sheets).forEach((sheet, i) => {
				if (i > 0) return;

				const rowObject = XLSX.utils.sheet_to_json(sheet, {raw: true});
				resolve(rowObject as T[]);
			});
		};

		fileReader.readAsBinaryString(file);
	});
}

export function formData<T extends FieldValues, P extends FieldPath<T>>(
	obj: T,
) {
	return {
		get(path: P) {
			return objectPath.get(obj, path);
		},
		set(path: P, value: T[P]) {
			const clonedObj = clone(obj);
			objectPath.set(clonedObj, path, value);
			return clonedObj;
		},
	};
}

export function sleep(timeout = 1000) {
	return new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, timeout);
	});
}

export function mutateCallback(
	{hide, show}: Pick<ReturnType<typeof useLoader>, 'hide' | 'show'>,
	withDefault = true,
): any {
	return {
		...(withDefault ? defaultErrorMutation : {}),
		onMutate() {
			show?.();
		},
		onSettled() {
			hide?.();
		},
	} as UseTRPCMutationOptions<any, any, any>;
}

export function getIds<
	F extends Fields,
	KK extends DeepPartialSkipArrayKey<F>,
	P extends keyof KK,
>(dataForm: KK, property?: P) {
	const selectedIds = !!property ? transformIds(dataForm[property]) : [];
	return {selectedIds, property, enabled: selectedIds.length > 0};
}

export function formParser<
	F extends Fields,
	KK extends DeepPartialSkipArrayKey<F>,
	P extends keyof KK,
>(dataForm: KK, {pageName, property}: {property?: P; pageName?: string}) {
	const ids = getIds(dataForm, property);
	const modal = modalTypeParser(dataForm.type, pageName);

	return {...ids, ...modal};
}

export function transformIds(dataObj?: MyObject<undefined | boolean>) {
	const selectedIds = Object.entries(dataObj ?? {}).reduce<string[]>(
		(ret, [id, val]) => {
			if (val) ret.push(id);
			return ret;
		},
		[],
	);

	return selectedIds;
}

export function nullUseQuery() {
	type Ret = UseTRPCQueryResult<{}[], unknown>;

	return {
		data: [] as {}[],
		refetch: noopVoid,
		isFetching: false,
		isFetched: true,
	} as Ret;
}

export function nullRenderItem() {
	return {};
}

export function renderItemAsIs<T extends {}>(item: T) {
	const obj = Object.entries(item);

	return obj.reduce<MyObject<unknown>>((ret, [key, value]) => {
		return {...ret, [key.ucwords()]: value};
	}, {});
}

export function renderIndex<T extends Partial<ZIndex> & {dIndex?: TIndex} & {}>(
	item: T,
	defaultValue?: string,
) {
	const {index_str, index_number, dIndex} = item ?? {};

	const prefix = dIndex?.prefix?.replace(
		regPrefix,
		index_number?.toString().padStart(1, '0') ?? '',
	);

	return index_str ?? prefix ?? defaultValue;
}

export function isAdminRole(role?: string) {
	return role === USER_ROLE.ADMIN || role === USER_ROLE.S_ADMIN;
}

import {ReactNode} from "react";

import classnames from "clsx";
import jsPDF, {jsPDFOptions} from "jspdf";
import clone from "just-clone";
import * as momentTz from "moment-timezone";
import objectPath from "object-path";
import {FieldPath, FieldValues} from "react-hook-form";
import * as XLSX from "xlsx";

import {
	Route,
	RouterOutput,
	TDecimal,
	UnitQty,
	UQtyList,
} from "@appTypes/app.type";
import {ModalTypeSelect, TScanItem, TScanTarget} from "@appTypes/app.zod";
import {
	defaultErrorMutation,
	formatDateStringView,
	formatDateView,
	formatFullView,
	formatHour,
	paperA4,
	qtyList,
} from "@constants";
import {useLoader} from "@hooks";
import {
	UseTRPCMutationOptions,
	UseTRPCQueryResult,
} from "@trpc/react-query/shared";

type Qty = typeof qtyList[number];

let typingTimer: NodeJS.Timeout;

momentTz.tz.setDefault("Asia/Jakarta");

export const moment = momentTz.default;

export function typingCallback(callback: () => void, timeout = 500) {
	clearTimeout(typingTimer);
	typingTimer = setTimeout(callback, timeout);
}

export const classNames = classnames;
export const dateUtils = {
	full: convertFull,
	hour: convertHour,
	date: convertDate,
	dateS: convertDateS,
};

export function isClosedParser(poData: RouterOutput["sppb"]["out"]["getPO"]) {
	return poData.map(po => {
		const uu = po.OrmCustomerSPPBIns.map(bin => {
			const dd = bin.OrmPOItemSppbIns?.map(item => {
				const itemInScan = itemInScanParser(bin?.OrmKanbans);

				const currentQty = qtyReduce((ret, {qtyKey: num}) => {
					item.OrmCustomerSPPBOutItems.forEach(itm => {
						ret[num] += itm[num]!;
					});
					return ret;
				});

				const compare = qtyMap(({qtyKey}) => {
					return currentQty?.[qtyKey] == (itemInScan?.[qtyKey] ?? 0);
				});

				return {
					...item,
					itemInScan,
					currentQty,
					isClosed: !compare.includes(false),
				};
			});
			return {
				...bin,
				OrmPOItemSppbIns: dd,
				isClosed: !dd.map(e => e.isClosed).includes(false),
			};
		});

		return {
			...po,
			OrmCustomerSPPBIns: uu,
			isClosed: !uu.map(e => e.isClosed).includes(false),
		};
	});
}

export function itemInScanParser(
	kanbans?: RouterOutput["sppb"]["out"]["getPO"][number]["OrmCustomerSPPBIns"][number]["OrmKanbans"],
) {
	return kanbans?.reduce((j, h) => {
		h.OrmScans.forEach(({item_finish_good: k}) => {
			qtyMap(({qtyKey, num}) => {
				if (!j[qtyKey]) j[qtyKey] = 0;
				j[qtyKey] += parseFloat(k?.[0]?.[num]?.toString() ?? "0");
			});
		});
		return j;
	}, {} as Record<UQtyList, TDecimal>);
}

type V = {
	qtyKey: `qty${Qty}`;
	unitKey: `unit${Qty}`;
	num: Qty;
};

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
		case "produksi":
			return [
				"Jumlah Planning",
				"Jumlah Produksi",
				"send to QC",
				"PROD",
				"KARTU PRODUKSI",
			];
		case "qc":
			return [
				"Jumlah Produksi",
				"Jumlah QC",
				"Send to Finish Good",
				"QC",
				"KARTU BARANG OK",
			];
		case "finish_good":
			return ["Jumlah QC", "Jumlah FG", "Diterima", "FG", "KARTU BARANG OK"];
		default:
			return [];
	}
}

export function prevDataScan(target: TScanTarget, data: TScanItem) {
	switch (target) {
		case "qc":
			return {data: data.item_produksi, reject: data.item_qc_reject};
		case "finish_good":
			return {data: data.item_qc, reject: null};
		default:
			return {data: null, reject: null};
	}
}

export function copyToClipboard(str: string) {
	const el = document.createElement("textarea");
	el.value = str;
	el.setAttribute("readonly", "");
	el.style.position = "absolute";
	el.style.left = "-9999px";
	document.body.appendChild(el);
	el.select();
	document.execCommand("copy");
	document.body.removeChild(el);
	alert("Token copied");
}

export function scanRouterParser(route: Route["route"]) {
	const isProduksi = route === "produksi";
	const isQC = route === "qc";
	const isFG = route === "finish_good";

	const title = isProduksi
		? "Produksi"
		: isQC
		? "QC"
		: isFG
		? "Finish Good"
		: "";

	return {isProduksi, isQC, isFG, title};
}

export function modalTypeParser(type?: ModalTypeSelect, pageName = "") {
	const isAdd = type === "add";
	const isEdit = type === "edit";
	const isPreview = type === "preview";
	const isDelete = type === "delete";
	const isSelect = type === "select";
	const isPreviewEdit = isEdit || isPreview;

	return {
		isEdit,
		isPreview,
		isAdd,
		isDelete,
		isSelect,
		isPreviewEdit,
		get modalTitle() {
			switch (type) {
				case "add":
					return `Tambah ${pageName}`;
				case "edit":
					return `Ubah ${pageName}`;
				case "preview":
					return `Detail ${pageName}`;
				case "delete":
					return `Hapus ${pageName}`;
				default:
					return "";
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
		if (typeof reader?.result === "string") callback(reader.result);

		callback(null);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	reader.onerror = function (_error) {
		callback(null);
	};
}

export async function generatePDF(
	ids: string[],
	filename = "a4",
	orientation: jsPDFOptions["orientation"] = "p",
) {
	let doc = new jsPDF({unit: "mm", orientation, format: "a4"});

	const pageHeight = doc.internal.pageSize.getHeight();
	const elements = ids.map(id => document.getElementById(id)).filter(Boolean);
	const scaleWidth =
		orientation === "p" || orientation === "portrait" ? paperA4[0] : paperA4[1];

	for (let index = 0; index < elements.length; index++) {
		const element = elements[index];
		if (index + 1 < elements.length) doc.addPage();
		doc = await htmlPage(doc, element!, index);
	}

	return doc.save(filename, {returnPromise: true});

	function htmlPage(pdf: jsPDF, element: HTMLElement, i: number) {
		return new Promise<jsPDF>(resolve => {
			pdf.html(element, {
				x: 0,
				margin: 0,
				y: i * pageHeight,
				html2canvas: {
					width: element.clientWidth,
					scale: scaleWidth / element.clientWidth,
				},
				callback(pdfCallback) {
					resolve(pdfCallback);
				},
			});
		});
	}
}

export function paperSizeCalculator(
	width: number,
	options?: {orientation?: jsPDFOptions["orientation"]; minus?: number},
): [width: number, height: number] {
	const {orientation = "p", minus = 0} = options ?? {};
	const [a, b] = paperA4;
	const isPortrait = orientation === "p" || orientation === "portrait";
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

	const [filename = "data", sheetName = "Sheet 1"] = names ?? [];

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

			const workbook = XLSX.read(data, {type: "binary"});

			Object.values(workbook.Sheets).forEach((sheet, i) => {
				if (i > 0) return;

				const rowObject = XLSX.utils.sheet_to_json(sheet);
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

function convertDateS(date?: string) {
	if (!date) return null;

	return moment(date).format(formatDateStringView);
}

function convertDate(date?: string) {
	if (!date) return null;

	return moment(date).format(formatDateView);
}

function convertHour(date?: string) {
	if (!date) return null;

	return moment(date).format(formatHour);
}

function convertFull(date?: string) {
	if (!date) return null;

	return moment(date).format(formatFullView);
}

export function sleep(timeout = 1000) {
	return new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, timeout);
	});
}

export function mutateCallback(
	{hide, show}: Pick<ReturnType<typeof useLoader>, "hide" | "show">,
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

export function renderItemAsIs(item: any) {
	return item;
}

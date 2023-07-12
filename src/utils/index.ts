import {ReactNode} from "react";

import classnames from "clsx";
import jsPDF, {jsPDFOptions} from "jspdf";
import clone from "just-clone";
import moment from "moment";
import objectPath from "object-path";
import {FieldPath, FieldValues} from "react-hook-form";
import * as XLSX from "xlsx";

import {ModalTypeSelect, TScanItem, TScanTarget} from "@appTypes/app.zod";
import {
	formatDateStringView,
	formatDateView,
	formatFullView,
	formatHour,
	paperA4,
	qtyList,
} from "@constants";

type Qty = typeof qtyList[number];

let typingTimer: NodeJS.Timeout;

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

export function qtyMap(
	callback: (value: {
		qtyKey: `qty${Qty}`;
		unitKey: `unit${Qty}`;
		num: Qty;
	}) => ReactNode,
) {
	return qtyList.map(num => {
		const qtyKey = `qty${num}` as const;
		const unitKey = `unit${num}` as const;
		return callback({qtyKey, unitKey, num});
	});
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
				"Jumlah planning",
				"Jumlah Produksi",
				"send to QC",
				"PROD",
				"KARTU PRODUKSI",
			];
		case "qc":
			return [
				"Jumlah produksi",
				"Jumlah QC",
				"Send to Finish Good",
				"QC",
				"KARTU BARANG OK",
			];
		case "finish_good":
			return ["Jumlah qc", "Jumlah FG", "Diterima", "FG", "KARTU BARANG OK"];
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
	ids: string | string[],
	filename = "a4",
	orientation: jsPDFOptions["orientation"] = "p",
) {
	return new Promise<void>(async resolve => {
		const format = paperA4;

		const doc = new jsPDF({unit: "mm", orientation, format});

		const elements = Array.isArray(ids)
			? ids.map(id => document.getElementById(id))
			: [document.getElementById(ids)];

		await htmlPage(doc, elements.filter(Boolean));
		resolve();
	});

	function htmlPage(doc: jsPDF, pages: HTMLElement[], index = 0) {
		const hasPages = pages.length > 0;
		const pageHeight = doc.internal.pageSize.getHeight();

		const element = pages[0];

		if (!hasPages) {
			return doc.save(`${filename}.pdf`, {returnPromise: true});
		}

		return Promise.resolve<void>(
			doc.html(element!, {
				x: 0,
				margin: 0,
				y: index * pageHeight,
				html2canvas: {
					width: document.body.clientWidth,
					scale: paperA4[1] / element!.clientWidth,
				},
				callback(pdf) {
					if (index > 0 && pages.length > 1) pdf.addPage("a4", "l");
					const restPages = pages.slice();
					restPages.splice(0, 1);
					htmlPage(pdf, restPages, index + 1);
				},
			}),
		);
	}
}

export function exportData<T extends object>(
	data?: T[],
	names?: [filename?: string, sheetName?: string],
) {
	if (!data) return;

	const [filename = "data", sheetName = "Sheet 1"] = names ?? [];

	const workbook = XLSX.utils.book_new();
	workbook.SheetNames.push(sheetName);
	workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(data);
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

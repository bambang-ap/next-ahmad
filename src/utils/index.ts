import {ReactNode} from "react";

import classnames from "clsx";
import jsPDF from "jspdf";
import clone from "just-clone";
import moment from "moment";
import objectPath from "object-path";
import {FieldPath, FieldValues} from "react-hook-form";

import {ModalTypePreview, TScanItem, TScanTarget} from "@appTypes/app.zod";
import {
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
): [jumlah?: string, jumlahNext?: string, submitText?: string] {
	switch (target) {
		case "produksi":
			return ["Jumlah planning", "Jumlah Produksi", "send to QC"];
		case "qc":
			return ["Jumlah produksi", "Jumlah QC", "Send to Finish Good"];
		case "finish_good":
			return ["Jumlah qc", "Jumlah FG", "Diterima"];
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

export function modalTypeParser(type?: ModalTypePreview, pageName = "") {
	const isEdit = type === "edit";
	const isPreview = type === "preview";
	const isDelete = type === "delete";
	const isPreviewEdit = isEdit || isPreview;

	return {
		isEdit,
		isPreview,
		isDelete,
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

export function generatePDF(id: string, filename = "a4") {
	const doc = new jsPDF({unit: "mm", orientation: "p", format: paperA4});
	const element = document.getElementById(id)!;

	return new Promise<void>(resolve => {
		doc.html(element, {
			html2canvas: {scale: paperA4[0] / element.clientWidth},
			async callback(document) {
				await document.save(`${filename}.pdf`, {returnPromise: true});
				resolve();
			},
		});
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

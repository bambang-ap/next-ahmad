import {ReactNode} from 'react';

import classnames from 'clsx';
import jsPDF from 'jspdf';
import moment from 'moment';

import {ModalTypePreview, TScanItem, TScanTarget} from '@appTypes/app.zod';
import {formatDateView, formatFullView, formatHour, qtyList} from '@constants';

export const classNames = classnames;
export const dateUtils = {
	full: convertFull,
	hour: convertHour,
	date: convertDate,
};

type Qty = typeof qtyList[number];

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
		case 'produksi':
			return ['Jumlah planning', 'Jumlah Produksi', 'send to QC'];
		case 'qc':
			return ['Jumlah produksi', 'Jumlah QC', 'Send to Finish Good'];
		case 'finish_good':
			return ['Jumlah qc', 'Jumlah FG', 'Diterima'];
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

export function modalTypeParser(type?: ModalTypePreview, pageName = '') {
	const isEdit = type === 'edit';
	const isPreview = type === 'preview';
	const isDelete = type === 'delete';
	const isPreviewEdit = isEdit || isPreview;

	return {
		isEdit,
		isPreview,
		isDelete,
		isPreviewEdit,
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

export function generatePDF(id: string, filename = 'a4') {
	const doc = new jsPDF({unit: 'px', orientation: 'p'});

	doc.html(document.getElementById(id) ?? '', {
		windowWidth: 100,
		callback(document) {
			document.save(`${filename}.pdf`);
		},
	});
}

export class Storage<T> {
	private key!: string;
	private primitive!: boolean;

	constructor(key: string, defaultValue: T) {
		this.key = key;
		this.primitive = this.isPrimitive(defaultValue);

		const isExist = !!this.get();
		if (!isExist) {
			const value = this.primitive
				? defaultValue
				: JSON.stringify(defaultValue);
			this.set(value as T);
		}
	}

	get() {
		const data = localStorage.getItem(this.key);
		try {
			if (this.primitive) return data as T;
			return JSON.parse(data!) as T;
		} catch (err) {
			return null;
		}
	}

	set(value: T) {
		if (this.primitive) localStorage.setItem(this.key, value as string);
		else localStorage.setItem(this.key, JSON.stringify(value));
	}

	del() {
		localStorage.removeItem(this.key);
	}

	private isPrimitive(test: any) {
		return test !== Object(test);
	}
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

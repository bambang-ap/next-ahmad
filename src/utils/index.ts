import {ReactNode} from 'react';

import classnames from 'classnames';
import jsPDF from 'jspdf';
import moment from 'moment';

import {ModalTypePreview, TScanItem, TScanTarget} from '@appTypes/app.zod';
import {formatDate, formatFull, formatHour} from '@constants';
import {qtyList} from '@pageComponent/ModalChild_po';

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
			return ['Jumlah produksi', 'Jumlah QC', 'OK'];
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

export function modalTypeParser(type: ModalTypePreview, pageName = '') {
	const isEdit = type === 'edit';
	const isPreview = type === 'preview';
	const isDelete = type === 'delete';
	const isPreviewEdit = isEdit || isPreview;

	const modalTitle =
		type === 'add'
			? `Tambah ${pageName}`
			: type === 'edit'
			? `Ubah ${pageName}`
			: type === 'preview'
			? `Detail ${pageName}`
			: `Hapus ${pageName}`;

	return {isEdit, isPreview, isDelete, isPreviewEdit, modalTitle};
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

	reader.onerror = function (error) {
		console.log('Error: ', error);
		callback(null);
	};
}

export function generatePDF(id: string, filename = 'a4.pdf') {
	const doc = new jsPDF({unit: 'px', orientation: 'p'});

	doc.html(document.getElementById(id) ?? '', {
		windowWidth: 100,
		callback(document) {
			document.save(filename);
		},
	});
}

function convertDate(date?: string) {
	if (!date) return null;

	return moment(date).format(formatDate);
}

function convertHour(date?: string) {
	if (!date) return null;

	return moment(date).format(formatHour);
}

function convertFull(date?: string) {
	if (!date) return null;

	return moment(date).format(formatFull);
}

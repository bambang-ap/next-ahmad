import classnames from 'classnames';
import jsPDF from 'jspdf';
import moment from 'moment';

import {ModalTypePreview} from '@appTypes/app.zod';
import {formatDate, formatFull, formatHour} from '@constants';

export const classNames = classnames;
export const dateUtils = {
	full: convertFull,
	hour: convertHour,
	date: convertDate,
};

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

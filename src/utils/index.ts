import classnames from 'classnames';
import jsPDF from 'jspdf';
import moment from 'moment';

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

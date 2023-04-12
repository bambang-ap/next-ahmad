import {TextFieldProps} from '@mui/material';
import type {OrderItem} from 'sequelize';
import {z} from 'zod';

import {AppRouter, TKanban} from '@appTypes/app.type';
import {TRPCClientError} from '@trpc/client';

export * from './colors';
export * from './pages';
export * from './sizes';

export const defaultLimit = 10;

export const focusInputClassName =
	'border-2 border-transparent focus-within:border-app-secondary-03';

export const inputClassName = 'px-2 py-1 rounded bg-white';

export const defaultExcludeColumn = []; // ['createdAt', 'updatedAt'];
export const defaultOrderBy = {order: [['createdAt', 'desc'] as OrderItem]};

export const formatDate = 'DD-MM-YYYY';
export const formatHour = 'HH:mm:ss';
export const formatFull = `${formatDate} - ${formatHour}`;

export const decimalRegex = /^(0|[1-9]\d*)(\.\d{1,100})?$/;
export const decimalSchema = z.string().regex(decimalRegex).transform(Number);

export const defaultInstruksi: TKanban['list_mesin'][number]['instruksi'][number] =
	{
		hardness: [''],
		id_instruksi: '',
		material: [''],
		parameter: [''],
		hardnessKategori: [''],
		parameterKategori: [''],
		materialKategori: [''],
	};

export const defaultTextFieldProps: TextFieldProps = {
	InputLabelProps: {shrink: true},
	variant: 'filled',
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

import {TextFieldProps} from '@mui/material';

import {TRPCClientError} from '@trpc/client';
import {AppRouter} from '@trpc/routers';

export * from './colors';
export * from './pages';
export * from './sizes';

export const focusInputClassName =
	'border-2 border-transparent focus-within:border-app-secondary-03';

export const inputClassName = 'px-2 py-1 rounded bg-white';

export const defaultExcludeColumn = ['createdAt', 'updatedAt'];

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

export const defaultTextFieldProps: TextFieldProps = {
	InputLabelProps: {shrink: true},
	variant: 'filled',
};

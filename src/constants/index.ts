import {TRPCClientError} from '@trpc/client';
import {AppRouter} from '@trpc/routers';

export * from './colors';
export * from './pages';
export * from './sizes';

export const focusInputClassName =
	'border-2 border-transparent focus-within:border-app-secondary-03';

export const inputClassName = 'px-2 py-1 rounded bg-white';

export const defaultExcludeColumn = ['createdAt', 'updatedAt'];

export const defaultErrorMutation = {
	onError(err: TRPCClientError<AppRouter>) {
		alert(err?.message);
	},
} as const;

import {useForm} from 'react-hook-form';

import {TableFormValue} from '@appTypes/app.type';
import {defaultLimit} from '@constants';

export function useTable() {
	const hookForm = useForm<TableFormValue>({
		defaultValues: {
			limit: defaultLimit,
			page: 1,
			pageTotal: 1,
			search: '',
		},
	});
	const formValue = hookForm.watch();

	return {hookForm, formValue};
}

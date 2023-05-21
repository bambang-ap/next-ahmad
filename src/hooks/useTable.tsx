import {useForm} from "react-hook-form";

import {TableFormValue} from "@appTypes/app.type";
import {defaultLimit} from "@constants";

export function useTableFilter(defaultValue?: Partial<TableFormValue>) {
	const defaultValues = {
		limit: defaultLimit,
		page: 1,
		pageTotal: 1,
		search: "",
		...defaultValue,
	};

	const hookForm = useForm<TableFormValue>({defaultValues});

	const formValue = hookForm.watch();

	return {hookForm, formValue};
}

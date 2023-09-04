import {ForwardedRef, forwardRef, useImperativeHandle} from "react";

import {PagingResult, TableFormValue} from "@appTypes/app.type";
import {useTableFilter} from "@hooks";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";

import {TableFilter, TableFilterProps} from "./TableFilter";

type AdditionalTableFilterV2Props<T> = {
	useQuery: (
		form: TableFormValue,
	) => UseTRPCQueryResult<PagingResult<T>, unknown>;
};

export type TableFilterV2Props<T> = AdditionalTableFilterV2Props<T> &
	Omit<TableFilterProps<T>, "form" | "data">;

export type TableFilterV2Ref = {refetch: NoopVoid};
export const TableFilterV2 = forwardRef(TableFilterV2Component);

function TableFilterV2Component<T>(
	{useQuery, ...props}: TableFilterV2Props<T>,
	ref: ForwardedRef<TableFilterV2Ref>,
) {
	const {formValue, hookForm} = useTableFilter();
	const {data, refetch} = useQuery(formValue);

	useImperativeHandle(ref, () => {
		return {refetch};
	});

	return <TableFilter form={hookForm} data={data} {...props} />;
}

import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import {exportData} from "@utils";

export function useExportData<
	T,
	W extends UseTRPCQueryResult<T, unknown>,
	R extends {},
>(
	useQueries: () => W[],
	renderItem: (item: W) => R,
	names?: Parameters<typeof exportData>[1],
) {
	const datas = useQueries();

	const result = datas.map(renderItem);

	function exportResult(callback?: NoopVoid) {
		exportData(result, names);
		callback?.();
	}

	return {exportResult};
}

export function useNewExportData<
	T,
	R extends {},
	W extends UseTRPCQueryResult<T[], unknown>,
>(
	query: [useQuery: () => W, header: ObjKeyof<R>[]] | (() => W),
	renderItem: (item: NonNullable<W["data"]>[number]) => R,
	names?: Parameters<typeof exportData>[1],
) {
	let useQuery: () => W, header: ObjKeyof<R>[];
	if (Array.isArray(query)) [useQuery, header] = query;
	else useQuery = query;

	const {data} = useQuery();

	const result = data?.map(renderItem);

	function exportResult(callback?: NoopVoid) {
		exportData(result, names, header);
		callback?.();
	}

	return {exportResult};
}

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

	function exportResult() {
		exportData(result, names);
	}

	return {exportResult};
}

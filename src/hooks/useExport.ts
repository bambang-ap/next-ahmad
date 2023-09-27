import {useEffect, useState} from "react";

import * as XLSX from "xlsx";

import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import {exportData} from "@utils";

import {useLoader} from "./useLoader";

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
	debug?: true,
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

	// eslint-disable-next-line no-console
	if (debug) console.log(result);

	return {exportResult};
}

export function useExport<
	T,
	R extends {},
	W extends UseTRPCQueryResult<T[], unknown>,
>(
	config: {
		debug?: true;
		header?: ObjKeyof<R>[];
		names?: [filename?: string, sheetName?: string];
		loader: Omit<ReturnType<typeof useLoader>, "mutateOpts">;
		renderItem: (item: NonNullable<W["data"]>[number]) => R;
	},
	useQuery: () => W,
) {
	const [isExporting, setIsExporting] = useState(false);

	const {data, isFetching, isInitialLoading} = useQuery();

	const {renderItem, loader, debug, header, names} = config;

	async function exportResult() {
		loader.show?.();
		if (isFetching && !isExporting) setIsExporting(true);

		const result = data?.map(renderItem);

		if (!result) return;

		// eslint-disable-next-line no-console
		if (debug) console.log(result);

		const [filename = "data", sheetName = "Sheet 1"] = names ?? [];

		const workbook = XLSX.utils.book_new();
		workbook.SheetNames.push(sheetName);
		workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(result, {header});
		XLSX.writeFile(workbook, `${filename}.xlsx`);
		loader.hide?.();
		setIsExporting(false);
	}

	useEffect(() => {
		if (!isFetching && isExporting) exportResult();
	}, [isFetching, isExporting]);

	useEffect(() => {
		if (!isInitialLoading && !isFetching && isExporting) {
			alert("Failed to load data!");
			setIsExporting(false);
			loader.hide?.();
		}
	}, [isInitialLoading, isFetching, isExporting]);

	return exportResult;
}

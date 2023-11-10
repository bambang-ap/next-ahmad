import {useEffect, useState} from 'react';

import * as XLSX from 'xlsx';

import {useLoader} from '@hooks';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';

export type Headers = (
	| string
	| [colspan: number, title: string]
	| [title: string, rowspan: number]
)[][];
export type GenExportProps<T, W extends UseTRPCQueryResult<T[], unknown>> = {
	debug?: boolean;
	filename?: string;
	headers: Headers;
	names?: [filename?: string, sheetName?: string];
	useQuery: () => W;
	renderItem: (item: NonNullable<W['data']>[number]) => JSX.Element;
	loader?: Pick<ReturnType<typeof useLoader>, 'show' | 'hide'>;
};

export function useGenExport<T, W extends UseTRPCQueryResult<T[], unknown>>(
	props: GenExportProps<T, W>,
) {
	const {headers, names, debug, renderItem, useQuery, loader} = props;

	const {data, isFetching, isInitialLoading} = useQuery();
	const [isExporting, setIsExporting] = useState(false);

	const className = debug ? '' : 'h-0 overflow-hidden -z-10 fixed';
	const tagId = 'table-instance';

	const component = (
		<div className={className}>
			<table id={tagId}>
				<thead>
					{headers.map((header, i) => {
						return (
							<tr key={i}>
								{header.map((head, ii) => {
									const key = `${i} ${ii}`;
									if (Array.isArray(head)) {
										if (typeof head[0] === 'number') {
											const [rowSpan, title] = head;
											return (
												<td className="font-bold" key={key} rowSpan={rowSpan}>
													{title}
												</td>
											);
										} else {
											const [title, colSpan] = head;
											return (
												<td
													key={key}
													className="font-bold"
													colSpan={colSpan as number}>
													{title}
												</td>
											);
										}
									}

									return (
										<td className="font-bold" key={key}>
											{head}
										</td>
									);
								})}
							</tr>
						);
					})}
				</thead>
				<tbody>{data?.map(renderItem)}</tbody>
			</table>
		</div>
	);

	async function exportResult() {
		loader?.show?.();
		if (isFetching && !isExporting) setIsExporting(true);

		const [filename = 'data', sheetName = 'Sheet 1'] = names ?? [];

		const element = document.getElementById(tagId);

		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.table_to_sheet(element, {raw: true});

		XLSX.utils.book_append_sheet(wb, ws, sheetName);
		XLSX.writeFile(wb, `${filename}.xlsx`);

		loader?.hide?.();
		setIsExporting(false);
	}

	useEffect(() => {
		if (!isFetching && isExporting) exportResult();
	}, [isFetching, isExporting]);

	useEffect(() => {
		if (!isInitialLoading && !isFetching && isExporting) {
			alert('Failed to load data!');
			setIsExporting(false);
			loader?.hide?.();
		}
	}, [isInitialLoading, isFetching, isExporting]);

	return {component, exportResult};
}

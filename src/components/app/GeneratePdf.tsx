import {forwardRef, useImperativeHandle} from "react";

import {jsPDFOptions} from "jspdf";

import {ZId} from "@appTypes/app.type";
import {CheckBox} from "@components";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import {classNames, generatePDF, sleep} from "@utils";

export type GenPdfRef = {generate: (timeout?: number) => Promise<void>};
export type GenPdfProps<T, W extends UseTRPCQueryResult<T, unknown>> = {
	debug?: boolean;
	tagId: string;
	width?: string;
	filename?: string;
	splitPagePer?: number;
	useQueries: () => W[];
	renderItem: (item: W) => JSX.Element;
	orientation?: jsPDFOptions["orientation"];
};

export const GeneratePdf = forwardRef(function GGenPdf<
	T,
	W extends UseTRPCQueryResult<T, unknown>,
>(props: GenPdfProps<T, W>, ref: React.ForwardedRef<GenPdfRef>) {
	const {
		tagId,
		debug,
		orientation,
		filename = "file",
		width = "w-[1600px]",
		useQueries,
		splitPagePer,
		renderItem,
	} = props;

	const datas = useQueries();

	const className = debug ? "" : "h-0 overflow-hidden -z-10 fixed";

	const pageDatas = splitPagePer
		? datas.reduce<{page: number; datas: W[][]}>(
				(ret, cur) => {
					if (!ret.datas[ret.page]) ret.datas[ret.page] = [];
					ret.datas[ret.page]?.push(cur);
					if (ret.datas[ret.page]?.length === splitPagePer) ret.page++;
					return ret;
				},
				{page: 0, datas: []},
		  ).datas
		: [datas];

	async function generate(timeout = 2500) {
		await sleep(timeout);
		// generatePDF([tagId, tagId, tagId], filename, orientation);
		generatePDF(
			datas.map(({}, index) => `${tagId}-Page-${index}`),
			filename,
			orientation,
		);
	}

	useImperativeHandle(ref, () => {
		return {generate};
	});

	return (
		<div className={className}>
			{pageDatas.map((dataList, index) => {
				return (
					<div
						key={index}
						id={`${tagId}-Page-${index}`}
						className={classNames("flex flex-wrap", width)}>
						{dataList.map(item => renderItem(item))}
					</div>
				);
			})}
		</div>
	);
});

type SelectAllButtonProps<T extends object, G extends {}, D extends ZId & G> = {
	form: T;
	property: keyof T;
	data?: D[];
	total?: number;
	selected: number;
	selector?: string;
	onClick?: (
		selectedIds?: T & {
			[x: string]: MyObject<boolean> | undefined;
		},
	) => void;
};

export function SelectAllButton<
	T extends object,
	G extends {},
	D extends ZId & G,
>({
	form: prev,
	onClick,
	property,
	data,
	selected,
	total = 0,
	selector = "id",
}: SelectAllButtonProps<T, G, D>) {
	const isSelectedAll = selected === total;
	const isSomeSelected = selected < total && selected !== 0;

	function selectAll() {
		const selectedIds = {
			...prev,
			[property]: isSelectedAll
				? {}
				: data?.reduce<MyObject<boolean>>((ret, cur) => {
						// @ts-ignore
						return {...ret, [cur[selector]]: true};
				  }, {}),
		};
		onClick?.(selectedIds);
	}

	return (
		<CheckBox
			onCheck={selectAll}
			value={isSomeSelected ? "@" : isSelectedAll}
		/>
	);
}

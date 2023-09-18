import {forwardRef, useEffect, useImperativeHandle, useState} from "react";

import {jsPDFOptions} from "jspdf";

import {ZId} from "@appTypes/app.type";
import {CheckBox} from "@components";
import {useLoader} from "@hooks";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import {classNames, generatePDF, sleep} from "@utils";

export type GenPdfRef = {generate: (timeout?: number) => Promise<void>};
export type GenPdfProps<T, W extends UseTRPCQueryResult<T[], unknown>> = {
	debug?: boolean;
	tagId: string;
	width?: string;
	filename?: string;
	splitPagePer?: number;
	useQuery: () => W;
	renderItem: (item: NonNullable<W["data"]>[number]) => JSX.Element;
	orientation?: jsPDFOptions["orientation"];
};

export const GeneratePdfV2 = forwardRef(function GGenPdf<
	T,
	W extends UseTRPCQueryResult<T[], unknown>,
>(props: GenPdfProps<T, W>, ref: React.ForwardedRef<GenPdfRef>) {
	const {
		tagId,
		debug,
		orientation,
		filename = "file",
		width = "w-[1600px]",
		useQuery: useQueries,
		splitPagePer,
		renderItem,
	} = props;

	const loader = useLoader();
	const {data: datas, isFetched} = useQueries();
	const [isPrinting, setIsPrinting] = useState(false);
	const [timeoutCount, setTimeoutCount] = useState(2500);

	const className = debug ? "" : "h-0 overflow-hidden -z-10 fixed";

	const pageDatas = splitPagePer
		? datas?.reduce<{page: number; datas: T[][]}>(
				(ret, cur) => {
					if (!ret.datas[ret.page]) ret.datas[ret.page] = [];
					ret.datas[ret.page]?.push(cur);
					if (ret.datas[ret.page]?.length === splitPagePer) ret.page++;
					return ret;
				},
				{page: 0, datas: []},
		  ).datas
		: [datas];

	async function generatePrint(timeout: number) {
		await sleep(timeout);
		generatePDF(
			datas?.map(({}, index) => `${tagId}-Page-${index}`) ?? [],
			filename,
			orientation,
		);
	}

	async function generate(timeout = 2500) {
		loader.show?.();
		setTimeoutCount(timeout);
		setIsPrinting(true);
	}

	useImperativeHandle(ref, () => {
		return {generate};
	});

	useEffect(() => {
		if (!isPrinting) loader.hide?.();
		if (isPrinting && isFetched) {
			generatePrint(timeoutCount).then(() => setIsPrinting(false));
		}
	}, [isPrinting, isFetched]);

	return (
		<div className={className}>
			{loader.component}
			{pageDatas?.map((dataList, index) => {
				return (
					<div
						key={index}
						id={`${tagId}-Page-${index}`}
						className={classNames("flex flex-wrap", width)}>
						{dataList?.map(item => renderItem(item))}
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

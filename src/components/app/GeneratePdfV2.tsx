import {forwardRef, useEffect, useImperativeHandle, useState} from 'react';

import {GenPdfOpts, ZId} from '@appTypes/app.type';
import {CheckBox} from '@components';
import {useLoader} from '@hooks';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {generatePDF, sleep} from '@utils';

export type GenPdfRef = {generate: (timeout?: number) => Promise<void>};
export type GenPdfProps<T, W extends UseTRPCQueryResult<T[], unknown>> = {
	debug?: boolean;
	tagId: string;
	width?: number;
	splitPagePer?: number;
	useQuery: () => W | T[];
	renderItem: (item: NonNullable<W['data']>[number]) => JSX.Element;
} & GenPdfOpts;

export const GeneratePdfV2 = forwardRef(function GGenPdf<
	T,
	W extends UseTRPCQueryResult<T[], unknown>,
>(props: GenPdfProps<T, W>, ref: React.ForwardedRef<GenPdfRef>) {
	const {
		tagId,
		debug,
		width = 1600,
		useQuery: useQueries,
		splitPagePer,
		renderItem,

		paperSize,
		orientation,
		filename = 'file',
	} = props;

	const loader = useLoader();
	const query = useQueries();
	const [isPrinting, setIsPrinting] = useState(false);
	const [timeoutCount, setTimeoutCount] = useState(2500);

	let queryOrData: W;

	if (!Array.isArray(query)) queryOrData = query;
	else queryOrData = {data: query, isFetched: true} as W;

	const {data: datas, isFetched} = queryOrData;

	const className = debug ? '' : 'h-0 overflow-hidden -z-10 fixed';

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

	const elementsId = pageDatas?.map((_, index) => `${tagId}-Page-${index}`);

	async function generatePrint(timeout: number) {
		await sleep(timeout);
		await generatePDF(elementsId!, {filename, orientation, paperSize});
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
						style={{width}}
						id={elementsId![index]}
						className={'flex flex-wrap'}>
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
	selector = 'id',
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
			value={isSomeSelected ? '@' : isSelectedAll}
		/>
	);
}

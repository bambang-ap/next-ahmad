import {forwardRef, PropsWithChildren, useImperativeHandle} from "react";

import {jsPDFOptions} from "jspdf";

import {Button} from "@components";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import {classNames, generatePDF, sleep} from "@utils";

export type GenPdfRef = {generate: () => Promise<void>};
export type GenPdfProps = PropsWithChildren<{
	tagId: string;
	filename?: string;
	isReady?: boolean;
}>;

export const GeneratePdf = forwardRef(function GGenPdf<
	T,
	W extends UseTRPCQueryResult<T, unknown>,
>(
	props: {
		tagId: string;
		width?: string;
		filename?: string;
		splitPagePer?: number;
		useQueries: () => W[];
		renderItem: (item: W) => JSX.Element;
		orientation?: jsPDFOptions["orientation"];
	},
	ref: React.ForwardedRef<GenPdfRef>,
) {
	const className = "h-0 overflow-hidden -z-10 fixed";
	// const className = "";

	const {
		tagId,
		orientation,
		filename = "file",
		width = "w-[1600px]",
		useQueries,
		splitPagePer,
		renderItem,
	} = props;

	const datas = useQueries();

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

	async function generate() {
		await sleep(2500);
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

type SelectAllButtonProps = {
	total?: number;
	selected: number;
	onClick?: () => void;
};

export function SelectAllButton({
	onClick,
	selected,
	total = 0,
}: SelectAllButtonProps) {
	const btnText =
		selected === 0
			? "Select All"
			: selected < total
			? "Select All Rest"
			: "Unselect All";

	return <Button onClick={onClick}>{btnText}</Button>;
}

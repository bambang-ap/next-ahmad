import {forwardRef, PropsWithChildren, useImperativeHandle} from "react";

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
		useQueries: () => W[];
		renderItem: (item: W) => JSX.Element;
	},
	ref: React.ForwardedRef<GenPdfRef>,
) {
	const className = "h-0 overflow-hidden -z-10 fixed";
	// const className = "";

	const {
		tagId,
		filename = "file",
		width = "w-[1600px]",
		useQueries,
		renderItem,
	} = props;

	const datas = useQueries();

	async function generate() {
		await sleep(2500);
		generatePDF(tagId, filename);
	}

	useImperativeHandle(ref, () => {
		return {generate};
	});

	return (
		<div className={className}>
			<div id={tagId} className={classNames("flex flex-wrap", width)}>
				{datas.map(item => renderItem(item))}
			</div>
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

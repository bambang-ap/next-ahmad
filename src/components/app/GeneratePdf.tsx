import {forwardRef, PropsWithChildren, useImperativeHandle} from "react";

import {generatePDF} from "@utils";

export type GenPdfRef = {generate: () => Promise<void>};
export type GenPdfProps = PropsWithChildren<{
	tagId: string;
	filename?: string;
	isReady?: boolean;
}>;

export const GeneratePDF = forwardRef<GenPdfRef, GenPdfProps>(function GenPDF(
	props,
	ref,
) {
	const {tagId, children, filename = "file"} = props;
	const className = "h-0 overflow-hidden -z-10 fixed";
	// const className = "";

	useImperativeHandle(
		ref,
		() => {
			return {generate: () => generatePDF(tagId, filename)};
		},
		[],
	);

	return (
		<div className={className}>
			<div id={tagId} className="flex flex-wrap w-[1600px]">
				{children}
			</div>
		</div>
	);
});

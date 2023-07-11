import {forwardRef, PropsWithChildren, useImperativeHandle} from "react";

import {Control, UseFormReset, useWatch} from "react-hook-form";

import {ModalTypeSelect} from "@appTypes/app.type";
import {Button} from "@components";
import {generatePDF, modalTypeParser} from "@utils";

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

export function BatchPrintButton({
	reset,
	control,
	children,
	dataPrint,
}: PropsWithChildren<{
	dataPrint: JSX.Element;
	control: Control<{type: ModalTypeSelect}>;
	reset: UseFormReset<{type: ModalTypeSelect}>;
}>) {
	const type = useWatch({control, name: "type"});
	const {isSelect} = modalTypeParser(type);

	if (isSelect) {
		return (
			<>
				{dataPrint}
				<Button
					onClick={() =>
						reset(prev => {
							return {...prev, type: undefined};
						})
					}>
					Batal
				</Button>
			</>
		);
	}

	return (
		<>
			<Button
				onClick={() =>
					reset(prev => {
						return {...prev, type: "select"};
					})
				}>
				Batch Print
			</Button>
			{children}
		</>
	);
}

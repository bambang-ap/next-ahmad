import {forwardRef, PropsWithChildren, useImperativeHandle} from "react";

import {Control, UseFormReset, useWatch} from "react-hook-form";

import {ModalTypeSelect} from "@appTypes/app.type";
import {Button} from "@components";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import {classNames, generatePDF, modalTypeParser, sleep} from "@utils";

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
			{dataPrint}
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

export const GGenPdf = forwardRef(function GGenPdf<
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

import {ForwardedRef, forwardRef, useImperativeHandle, useRef} from "react";

import {DeepPartialSkipArrayKey, FieldValues, useWatch} from "react-hook-form";

import {
	GeneratePdf,
	GenPdfProps,
	GenPdfRef,
	SelectAllButton,
} from "@appComponent/GeneratePdf";
import {FormProps, ModalTypeSelect} from "@appTypes/app.type";
import {Button, TableFilterV2Props} from "@components";
import {useLoader, useNewExportData, useTableFilter} from "@hooks";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import {modalTypeParser, sleep, transformIds} from "@utils";

import {TableFilter} from "./TableFilter";

type Fields = {type: ModalTypeSelect} & FieldValues;
type TableFilterV3Props<
	T extends {},
	F extends Fields,
	P extends keyof DeepPartialSkipArrayKey<F>,
	TT,
	WW extends UseTRPCQueryResult<TT, unknown>,
> = FormProps<F, "reset" | "control"> &
	TableFilterV2Props<T> &
	Partial<ReturnType<typeof useNewExportData>> & {
		property: P;
		onCancel?: NoopVoid;
		enabledExport?: boolean;
		enabledPdf?: boolean;
		genPdfOptions?: GenPdfProps<TT, WW>;
		selector?: ObjKeyof<T>;
	};

export const TableFilterV3 = forwardRef(TableFilterV3Component);
export type TableFilterV3Ref = {
	refetch?: NoopVoid;
	printData?: (idOrAll: true | string) => Promise<any>;
};

function TableFilterV3Component<
	T extends {},
	F extends Fields,
	P extends keyof DeepPartialSkipArrayKey<F>,
	TT,
	WW extends UseTRPCQueryResult<TT, unknown>,
>(
	props: TableFilterV3Props<T, F, P, TT, WW>,
	ref: ForwardedRef<TableFilterV3Ref>,
) {
	const {
		useQuery,
		reset,
		property,
		control,
		onCancel,
		exportResult,
		topComponent: tC,
		header = [],
		enabledExport,
		enabledPdf,
		genPdfOptions,
		selector,
		...tableProps
	} = props;

	const {formValue, hookForm} = useTableFilter();
	const {data, refetch} = useQuery(formValue);

	const loader = useLoader();
	const dataForm = useWatch({control});
	const genPdfRef = useRef<GenPdfRef>(null);

	const {type: modalType} = dataForm;
	const {isSelect} = modalTypeParser(modalType, "SPPB In");

	const selectedIds = transformIds(dataForm[property]);
	const topComponent =
		enabledExport || enabledPdf ? (
			isSelect ? (
				<>
					{enabledExport && <Button onClick={exportData}>Export</Button>}
					{enabledPdf && <Button onClick={() => printData(true)}>Print</Button>}
					<Button onClick={onCancel}>Batal</Button>
				</>
			) : (
				<>
					<Button onClick={() => reset(prev => ({...prev, type: "select"}))}>
						Select
					</Button>
					{tC}
				</>
			)
		) : null;

	async function exportData() {
		if (!enabledExport) return;
		if (!exportResult) return;
		if (selectedIds?.length <= 0) {
			return alert("Silahkan pilih data terlebih dahulu");
		}

		loader?.show?.();
		exportResult();
		loader?.hide?.();
		reset(prev => ({...prev, type: undefined}));
		await sleep(2500);
		reset(prev => ({...prev, [property]: {}}));
	}

	async function printData(idOrAll: true | string): Promise<any> {
		if (!enabledPdf) return;

		loader?.show?.();
		if (typeof idOrAll === "string") {
			reset(prev => ({...prev, [property]: {[idOrAll]: true}}));
			await sleep(250);
			return printData(true);
		} else {
			if (selectedIds.length <= 0) {
				loader?.hide?.();
				return alert("Silahkan pilih data terlebih dahulu");
			}
		}
		await genPdfRef.current?.generate();
		loader?.hide?.();
		reset(prev => ({...prev, type: undefined}));
		setTimeout(() => reset(prev => ({...prev, [property]: {}})), 2500);
	}

	useImperativeHandle(ref, () => {
		return {refetch, printData};
	});

	return (
		<>
			{/**
			 * TODO: Add Generate PDF
			 */}
			{loader.component}
			{enabledPdf && !!genPdfOptions && (
				<GeneratePdf ref={genPdfRef} {...genPdfOptions} />
			)}
			<TableFilter
				{...tableProps}
				form={hookForm}
				data={data}
				topComponent={topComponent}
				header={[
					isSelect && (
						<SelectAllButton
							// @ts-ignore
							data={data?.rows}
							form={dataForm}
							property={property}
							key="btnSelectAll"
							onClick={prev => reset(prev)}
							selected={selectedIds.length}
							total={data?.rows.length}
							selector={selector}
						/>
					),
					...header,
				]}
			/>
		</>
	);
}

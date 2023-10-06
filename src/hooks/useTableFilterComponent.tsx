import {useRef} from "react";

import {DeepPartialSkipArrayKey, FieldValues, useWatch} from "react-hook-form";

import {
	GeneratePdfV2,
	GenPdfProps,
	GenPdfRef,
	SelectAllButton,
} from "@appComponent/GeneratePdfV2";
import {
	FormProps,
	ModalTypeSelect,
	PagingResult,
	TableFormValue,
} from "@appTypes/app.type";
import {Button} from "@baseComps/Touchable/Button";
import {useExport, useLoader, useTableFilter} from "@hooks";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import {modalTypeParser, sleep, transformIds} from "@utils";

import {
	Cells,
	CellSelect as SelectCell,
	CellSelectProps,
	TableProps,
} from "../components/base/Table";
import {TableFilter} from "../components/base/Table/TableFilter";

type PrintData = (id: string) => void;
type G<F extends FieldValues> = Pick<CellSelectProps<F>, "fieldName">;
export type Fields = {type: ModalTypeSelect} & FieldValues;
export type TableFilterProps<T, F extends Fields> = Omit<
	TableProps<
		T,
		Cells & {printData: PrintData; CellSelect: (props: G<F>) => JSX.Element}
	>,
	"bottomComponent" | "data"
> & {
	disableSearch?: boolean;
};

type PropsA<T extends {}, F extends Fields> = TableFilterProps<T, F> &
	FormProps<F, "control" | "reset">;
type Props<
	T extends {},
	F extends Fields,
	P extends keyof DeepPartialSkipArrayKey<F>,
	ET,
	ER extends {},
	EQ extends UseTRPCQueryResult<ET[], unknown>,
	PT,
	PQ extends UseTRPCQueryResult<PT[], unknown>,
> = {
	property: P;
	selector?: ObjKeyof<T>;
	enabledExport?: boolean;
	useQuery: (
		form: TableFormValue,
	) => UseTRPCQueryResult<PagingResult<T>, unknown>;

	exportRenderItem: (item: NonNullable<EQ["data"]>[number]) => ER;
	exportUseQuery: () => EQ;

	genPdfOptions?: GenPdfProps<PT, PQ>;
} & PropsA<T, F>;

export function useTableFilterComponent<
	T extends {},
	F extends Fields,
	P extends keyof DeepPartialSkipArrayKey<F>,
	ET,
	ER extends {},
	EQ extends UseTRPCQueryResult<ET[], unknown>,
	PT,
	PQ extends UseTRPCQueryResult<PT[], unknown>,
>(props: Props<T, F, P, ET, ER, EQ, PT, PQ>) {
	const {
		topComponent: tC,
		selector,
		useQuery,
		header = [],
		control,
		reset,
		property,
		enabledExport = false,
		exportRenderItem,
		exportUseQuery,
		renderItem,
		renderItemEach,
		genPdfOptions,
		...tableProps
	} = props;

	const {formValue, hookForm} = useTableFilter();
	const {data, refetch, isFetching} = useQuery(formValue);
	const genPdfRef = useRef<GenPdfRef>(null);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const {mutateOpts, ...loader} = useLoader();
	const dataForm = useWatch({control});
	const exportData = useExport(
		{loader, renderItem: exportRenderItem},
		exportUseQuery,
	);

	const {isSelect} = modalTypeParser(dataForm.type);
	const selectedIds = transformIds(dataForm[property]);
	const enabledPdf = !!genPdfOptions;

	const topComponent = isSelect ? (
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
	);

	function onCancel() {
		reset(prev => ({...prev, type: undefined, [property]: {}}));
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
	}

	function CellSelect(cellProps: G<F>) {
		if (!isSelect) return <></>;

		return <SelectCell noLabel control={control} {...cellProps} />;
	}

	const component = (
		<>
			{loader.component}
			{enabledPdf && <GeneratePdfV2 ref={genPdfRef} {...genPdfOptions} />}
			<TableFilter
				{...tableProps}
				form={hookForm}
				data={data}
				isLoading={isFetching}
				topComponent={topComponent}
				renderItem={(item, i) =>
					renderItem?.({...item, printData, CellSelect}, i)!
				}
				renderItemEach={(item, i) =>
					renderItemEach?.({...item, printData, CellSelect}, i)!
				}
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

	return {component, mutateOpts, loader, refetch};
}

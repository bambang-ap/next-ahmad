import {ForwardedRef, forwardRef, useImperativeHandle} from "react";

import {DeepPartialSkipArrayKey, FieldValues, useWatch} from "react-hook-form";

import {SelectAllButton} from "@appComponent/GeneratePdf";
import {FormProps, ModalTypeSelect} from "@appTypes/app.type";
import {Button, TableFilterV2Props, TableFilterV2Ref} from "@components";
import {useLoader, useNewExportData, useTableFilter} from "@hooks";
import {modalTypeParser, sleep, transformIds} from "@utils";

import {TableFilter} from "./TableFilter";

type Fields = {type: ModalTypeSelect} & FieldValues;
type TableFilterV3Props<
	T,
	F extends Fields,
	P extends keyof DeepPartialSkipArrayKey<F>,
> = FormProps<F, "reset" | "control"> &
	TableFilterV2Props<T> &
	Partial<ReturnType<typeof useNewExportData>> & {
		property: P;
		onCancel?: NoopVoid;
	};

export const TableFilterV3 = forwardRef(TableFilterV3Component);

function TableFilterV3Component<
	T,
	F extends Fields,
	P extends keyof DeepPartialSkipArrayKey<F>,
>(props: TableFilterV3Props<T, F, P>, ref: ForwardedRef<TableFilterV2Ref>) {
	const {
		useQuery,
		reset,
		property,
		control,
		onCancel,
		exportResult,
		topComponent: tC,
		header = [],
		...tableProps
	} = props;

	const {formValue, hookForm} = useTableFilter();
	const {data, refetch} = useQuery(formValue);

	const loader = useLoader();
	const dataForm = useWatch({control});

	const {type: modalType} = dataForm;
	const {isSelect} = modalTypeParser(modalType, "SPPB In");

	const selectedIds = transformIds(dataForm[property]);
	const topComponent = isSelect ? (
		<>
			{!!exportResult && <Button onClick={exportData}>Export</Button>}
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

	async function exportData() {
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

	useImperativeHandle(ref, () => {
		return {refetch};
	});

	return (
		<>
			{/**
			 * TODO: Add Generate PDF
			 */}
			{loader.component}
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
						/>
					),
					...header,
				]}
			/>
		</>
	);
}

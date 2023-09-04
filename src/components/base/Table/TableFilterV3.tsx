import {forwardRef} from "react";

import {Button} from "@mui/material";
import {DeepPartialSkipArrayKey, FieldValues, useWatch} from "react-hook-form";

import {SelectAllButton} from "@appComponent/GeneratePdf";
import {FormProps, PagingResult} from "@appTypes/app.type";
import {ModalTypeSelect} from "@appTypes/app.zod";
import {useNewExportData} from "@hooks";
import {modalTypeParser, sleep, transformIds} from "@utils";

import {TableFilter, TableFilterProps} from "./TableFilter";

type UU = {type: ModalTypeSelect} & FieldValues;
type OO<
	T,
	F extends UU,
	P extends keyof DeepPartialSkipArrayKey<F>,
> = FormProps<F, "reset" | "control"> &
	TableFilterProps<T> &
	Partial<ReturnType<typeof useNewExportData>> & {
		property: P;
		onCancel?: NoopVoid;
		dataRender?: PagingResult<any>;
	};

export const TableFilterV3 = forwardRef(TableFilterV3Component);

function TableFilterV3Component<
	T,
	F extends UU,
	P extends keyof DeepPartialSkipArrayKey<F>,
>(props: OO<T, F, P>) {
	const {
		reset,
		property,
		control,
		onCancel,
		exportResult,
		data,
		dataRender,
		topComponent: tC,
		header = [],
		...tableProps
	} = props;

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

		exportResult();
		reset(prev => ({...prev, type: undefined}));
		await sleep(2500);
		reset(prev => ({...prev, [property]: {}}));
	}

	return (
		<TableFilter
			{...tableProps}
			data={data}
			topComponent={topComponent}
			header={[
				isSelect && (
					<SelectAllButton
						form={dataForm}
						property={property}
						key="btnSelectAll"
						data={dataRender?.rows}
						onClick={prev => reset(prev)}
						selected={selectedIds.length}
						total={dataRender?.rows.length}
					/>
				),
				...header,
			]}
		/>
	);
}

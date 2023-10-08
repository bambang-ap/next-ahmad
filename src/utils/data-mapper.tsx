import {Headers} from "@appComponent/GenerateExport";
import {UQty} from "@appTypes/app.type";
import {getPrintPoAttributes} from "@database";
import {qtyMap} from "@utils";

type MapperReturn<T> = {
	headers: Headers;
	renderItem: (data: T) => JSX.Element;
};

export function exportPoMapper(): MapperReturn<
	ReturnType<typeof getPrintPoAttributes>["Ret"]
> {
	const qtyHeader = Array.from({length: 8}).reduce<`Qty ${UQty}`[]>(ret => {
		return [...ret, ...qtyMap(({num}) => `Qty ${num}` as const)];
	}, []);

	const headers: Headers = [
		[
			[2, "No"],
			[2, "Customer"],
			[2, "No PO"],
			[2, "Tgl PO"],
			[2, "Due Date PO"],
			[2, "Nama Item"],
			[2, "Kode Item"],
			["QTY PO", 3],
			[2, "Nomor SJ Masuk"],
			["QTY SJ Masuk", 3],
			[2, "Nomor Kanban"],
			["QTY SJ Kanban", 3],
			["QTY QC", 3],
			["QTY Reject", 3],
			["QTY SJ Keluar", 3],
			["OT GLOBAL ( DARI SJ MASUK - SJ KELUAR )", 3],
			["OT PO ( PO MASUK - SJ MASUK )", 3],
			["OT KANBAN ( KANBAN - FG )", 3],
		],
		qtyHeader,
	];

	return {
		headers,
		renderItem: data => {
			return <></>;
		},
	};
}

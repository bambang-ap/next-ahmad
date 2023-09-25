import {TItemUnit} from "@appTypes/app.type";
import type {J} from "@trpc/routers/dashboard/main";
import {qtyMap} from "@utils";
import {trpc} from "@utils/trpc";

type Data = [name: string, data?: J, className?: string];

export function useQtyData() {
	const {data: dataPo} = trpc.dashboard.main.po.useQuery();
	const {data: dataSppbIn} = trpc.dashboard.main.sppbIn.useQuery();
	const {data: dataSppbOut} = trpc.dashboard.main.sppbOut.useQuery();
	const {data: dataKanban} = trpc.dashboard.main.kanban.useQuery();
	const {data: dataProduksi} = trpc.dashboard.main.scan.useQuery({
		target: "produksi",
	});
	const {data: dataQc} = trpc.dashboard.main.scan.useQuery({
		target: "qc",
	});
	const {data: dataFg} = trpc.dashboard.main.scan.useQuery({
		target: "finish_good",
	});

	const dataList: Data[] = [
		["PO", dataPo, "bg-emerald-500 text-white"],
		["SJ Masuk", dataSppbIn, "bg-amber-500 text-white"],
		["Kanban", dataKanban, "bg-cyan-500 text-white"],
		["Produksi", dataProduksi, "bg-blue-500 text-white"],
		["QC", dataQc, "bg-fuchsia-500 text-white"],
		["Finish Good", dataFg, "bg-lime-500 text-white"],
		["SJ Keluar", dataSppbOut, "bg-rose-500 text-white"],
	];

	function qtyParser(unit: TItemUnit) {
		const qtys = dataList.map(([name, summary, className]) => {
			const qty = qtyMap(({num}) => {
				const qtyData = summary?.[num].find(e => e.unit === unit);
				const hasQty = !!qtyData?.qty;
				return hasQty ? qtyData?.qty.toString() : "0";
			}).reduce((total, jumlah) => total + parseFloat(jumlah), 0);

			return [name, qty, className] as const;
		});

		return qtys;
	}

	return {dataList, qtyParser};
}

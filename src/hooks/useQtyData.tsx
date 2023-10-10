import {TItemUnit} from '@appTypes/app.type';
import {REJECT_REASON, REJECT_REASON_VIEW} from '@enum';
import type {J, U} from '@trpc/routers/dashboard/main';
import {classNames, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

type Data = [name: string, data?: J | [A?: J, B?: J], className?: string];

export function useQtyData() {
	const {data: dataPo} = trpc.dashboard.main.po.useQuery();
	const {data: dataSppbIn} = trpc.dashboard.main.sppbIn.useQuery();
	const {data: dataSppbOut} = trpc.dashboard.main.sppbOut.useQuery();
	const {data: dataKanban} = trpc.dashboard.main.kanban.useQuery();
	const {data: dataProduksi} = trpc.dashboard.main.scan.useQuery({
		status: 'produksi',
	});
	const {data: dataQc} = trpc.dashboard.main.scan.useQuery({
		status: 'qc',
	});
	const {data: dataFg} = trpc.dashboard.main.scan.useQuery({
		status: 'finish_good',
	});
	const {data: dataRejectRP} = trpc.dashboard.main.reject.useQuery({
		reason: REJECT_REASON.RP,
	});
	const {data: dataRejectTP} = trpc.dashboard.main.reject.useQuery({
		reason: REJECT_REASON.TP,
	});
	const {data: dataRejectSC} = trpc.dashboard.main.reject.useQuery({
		reason: REJECT_REASON.SC,
	});

	const dataList: Data[] = [
		['PO', dataPo, classNames('bg-emerald-500 text-white ')],
		['SJ Masuk', dataSppbIn, classNames('bg-amber-500 text-white')],
		['Kanban', dataKanban, classNames('bg-cyan-500 text-white')],
		['Produksi', dataProduksi, classNames('bg-blue-500 text-white')],
		['QC', dataQc, classNames('bg-fuchsia-500 text-white')],
		['Finish Good', dataFg, classNames('bg-lime-500 text-white')],
		['SJ Keluar', dataSppbOut, classNames('bg-rose-500 text-white')],
		[
			`Reject ${REJECT_REASON_VIEW.TP}`,
			dataRejectTP,
			classNames('bg-indigo-500 text-white'),
		],
		[
			`Reject ${REJECT_REASON_VIEW.RP}`,
			dataRejectRP,
			classNames('bg-teal-500 text-white'),
		],
		[
			`Reject ${REJECT_REASON_VIEW.SC}`,
			dataRejectSC,
			classNames('bg-yellow-500 text-white'),
		],
		['OT PO', [dataPo, dataSppbIn], classNames('bg-violet-500 text-white')],
		['OT Produksi', [dataKanban, dataFg], classNames('bg-sky-500 text-white')],
	];

	function qtyParser(unit: TItemUnit) {
		const qtys = dataList.map(([name, summary, className]) => {
			const qty = qtyMap(({num}) => {
				let qtyData: undefined | U;
				if (Array.isArray(summary)) {
					const [a, b] = summary;
					const jA = a?.[num].find(e => e.unit === unit);
					const jB = b?.[num].find(e => e.unit === unit);

					qtyData = {
						unit,
						qty:
							parseFloat(jA?.qty.toString() ?? '0') -
							parseFloat(jB?.qty.toString() ?? '0'),
					};
				} else {
					qtyData = summary?.[num].find(e => e.unit === unit);
				}

				const hasQty = !!qtyData?.qty;
				return hasQty ? qtyData?.qty.toString() : '0';
			}).reduce((total, jumlah) => total + parseFloat(jumlah ?? '0'), 0);

			return [name, qty, className] as const;
		});

		return qtys;
	}

	return {dataList, qtyParser};
}

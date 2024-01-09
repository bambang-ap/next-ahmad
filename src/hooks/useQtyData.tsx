import {useWatch} from 'react-hook-form';

import {FormProps, TItemUnit} from '@appTypes/app.type';
import {MenuColorClass, REJECT_REASON, REJECT_REASON_VIEW} from '@enum';
import {DashboardForm} from '@pageComponent/dashboard';
import type {J, U} from '@trpc/routers/dashboard/main';
import {classNames, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

type Data = [name: string, data?: J | [A?: J, B?: J], className?: string];

export function useQtyData({control}: FormProps<DashboardForm>) {
	const {filterFrom, filterTo} = useWatch({control});

	const {data: dataPo} = trpc.dashboard.main.po.useQuery({
		filterFrom,
		filterTo,
	});
	const {data: dataSppbIn} = trpc.dashboard.main.sppbIn.useQuery({
		filterFrom,
		filterTo,
	});
	const {data: dataSppbOut} = trpc.dashboard.main.sppbOut.useQuery({
		filterFrom,
		filterTo,
	});
	const {data: dataKanban} = trpc.dashboard.main.kanban.useQuery({
		filterFrom,
		filterTo,
	});
	const {data: dataProduksi} = trpc.dashboard.main.scan.useQuery({
		status: 'produksi',
		filterFrom,
		filterTo,
	});
	const {data: dataQc} = trpc.dashboard.main.scan.useQuery({
		status: 'qc',
		filterFrom,
		filterTo,
	});
	const {data: dataFg} = trpc.dashboard.main.scan.useQuery({
		status: 'finish_good',
		filterFrom,
		filterTo,
	});
	const {data: dataRejectRP} = trpc.dashboard.main.reject.useQuery({
		reason: REJECT_REASON.RP,
		filterFrom,
		filterTo,
	});
	const {data: dataRejectTP} = trpc.dashboard.main.reject.useQuery({
		reason: REJECT_REASON.TP,
		filterFrom,
		filterTo,
	});
	const {data: dataRejectSC} = trpc.dashboard.main.reject.useQuery({
		reason: REJECT_REASON.SC,
		filterFrom,
		filterTo,
	});

	const dataList: Data[] = [
		['PO', dataPo, classNames(MenuColorClass.PO, 'text-white')],
		['SJ Masuk', dataSppbIn, classNames(MenuColorClass.SJIn, 'text-white')],
		['Kanban', dataKanban, classNames(MenuColorClass.Kanban, 'text-white')],
		['Produksi', dataProduksi, classNames(MenuColorClass.Prod, 'text-white')],
		['QC', dataQc, classNames(MenuColorClass.QC, 'text-white')],
		['Finish Good', dataFg, classNames(MenuColorClass.FG, 'text-white')],
		['SJ Keluar', dataSppbOut, classNames(MenuColorClass.SJOut, 'text-white')],
		[
			REJECT_REASON_VIEW.TP,
			dataRejectTP,
			classNames(MenuColorClass[REJECT_REASON.TP], 'text-white'),
		],
		[
			REJECT_REASON_VIEW.RP,
			dataRejectRP,
			classNames(MenuColorClass[REJECT_REASON.RP], 'text-white'),
		],
		[
			REJECT_REASON_VIEW.SC,
			dataRejectSC,
			classNames(MenuColorClass[REJECT_REASON.SC], 'text-white'),
		],
		[
			'OT PO',
			[dataPo, dataSppbIn],
			classNames(MenuColorClass.OtPO, 'text-white'),
		],
		[
			'OT Produksi',
			[dataKanban, dataFg],
			classNames(MenuColorClass.OtProd, 'text-white'),
		],
		[
			'OT SJ Out',
			[dataFg, dataSppbOut],
			classNames(MenuColorClass.OtSjOut, 'text-white'),
		],
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

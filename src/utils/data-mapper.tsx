import {Headers} from '@appComponent/GenerateExport';
import {UnitQty, UnitUnit} from '@appTypes/app.type';
import {getPrintPoAttributes} from '@database';
import {qtyMap, renderIndex} from '@utils';

type MapperReturn<T> = {
	headers: Headers;
	renderItem: (data: T) => JSX.Element;
};

export function exportPoMapper(): MapperReturn<
	ReturnType<typeof getPrintPoAttributes>['Ret']
> {
	let i = 0;

	const qtyHeader = Array.from({length: 2}).reduce<string[]>(ret => {
		return [
			...ret,
			...qtyMap(({qtyKey, unitKey}) => [qtyKey, unitKey]).reduce(
				(a, b) => [...a, ...b],
				[],
			),
		];
	}, []);

	const headers: Headers = [
		[
			[2, 'No'],
			[2, 'Customer'],
			[2, 'No PO'],
			[2, 'Tgl PO'],
			[2, 'Due Date PO'],
			[2, 'Nama Item'],
			[2, 'Kode Item'],
			['PO', 6],
			[2, 'Nomor SJ Masuk'],
			['SJ Masuk', 6],
			[2, 'Nomor Kanban'],
			['Kanban', 6],
			['Produksi', 6],
			['QC', 6],
			['Finish Good', 6],
			['Reject', 6],
			['SJ Keluar', 6],
			['OT GLOBAL ( DARI SJ MASUK - SJ KELUAR )', 6],
			['OT PO ( PO MASUK - SJ MASUK )', 6],
			['OT KANBAN ( KANBAN - FG )', 6],
		],
		qtyHeader,
	];

	function renderQty(units: UnitUnit, qtys?: UnitQty) {
		return (
			<>
				{qtyMap(({qtyKey, unitKey}) => {
					const qty = qtys?.[qtyKey];

					if (!qtys || !qty || qty == 0) {
						return (
							<>
								<td />
								<td />
							</>
						);
					}

					return (
						<>
							{/* @ts-ignore */}
							<td data-t="n">{qty}</td>
							<td>{units[unitKey]}</td>
						</>
					);
				})}
			</>
		);
	}

	function renderOTQty(units: UnitUnit, qtys1?: UnitQty, qtys2?: UnitQty) {
		return (
			<>
				{qtyMap(({qtyKey, unitKey}) => {
					const qty1 = qtys1?.[qtyKey];
					const qty2 = qtys2?.[qtyKey];

					const qty1N = parseFloat(qty1?.toString() ?? '0');
					const qty2N = parseFloat(qty2?.toString() ?? '0');

					const calculated = qty1N - qty2N;

					if ((!qtys1 && !qtys2) || calculated <= 0) {
						return (
							<>
								<td />
								<td />
							</>
						);
					}

					return (
						<>
							{/* @ts-ignore */}
							<td data-t="n">{calculated}</td>
							<td>{units[unitKey]}</td>
						</>
					);
				})}
			</>
		);
	}

	return {
		headers,
		renderItem: data => {
			const {dCust, dPoItems} = data;
			const {dItem, dInItems} = dPoItems;
			const {dKnbItems, dSJIn, dOutItems} = dInItems ?? {};
			const {dKanban, dScanItems} = dKnbItems ?? {};

			const scanProd = dScanItems?.find(e => e.dScan.status === 'produksi');
			const scanQc = dScanItems?.find(e => e.dScan.status === 'qc');
			const scanFG = dScanItems?.find(e => e.dScan.status === 'finish_good');
			const hasFg = !!scanFG;
			const outItem = hasFg ? dOutItems : undefined;

			i++;

			return (
				<tr>
					<td>{i}</td>
					<td>{dCust.name}</td>
					<td>{data.nomor_po}</td>
					<td>{data.tgl_po}</td>
					<td>{data.due_date}</td>
					<td>{dItem.name}</td>
					<td>{dItem.kode_item}</td>
					{renderQty(dPoItems, dPoItems)}
					<td>{dSJIn?.nomor_surat}</td>
					{renderQty(dPoItems, dInItems)}
					<td>{renderIndex(dKanban!, dKanban?.nomor_kanban!)}</td>
					{renderQty(dPoItems, dKnbItems)}
					{renderQty(dPoItems, scanProd)}
					{renderQty(dPoItems, scanQc)}
					{renderQty(dPoItems, scanFG)}
					{renderQty(dPoItems, scanFG)} {/* Reject Qty */}
					{renderQty(dPoItems, outItem)}
					{renderOTQty(dPoItems, dInItems, outItem)}
					{renderOTQty(dPoItems, dPoItems, dInItems)}
					{renderOTQty(dPoItems, dKnbItems, scanFG)}
				</tr>
			);
		},
	};
}

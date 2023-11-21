import {FormType} from 'pages/app/internal';
import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {BorderTd, RootTable} from '@components';
import {numberFormat} from '@utils';
import {trpc} from '@utils/trpc';

type K = {calculated?: boolean} & FormProps<FormType, 'control'>;

export function InternalDashboard({control, calculated}: K) {
	const {from, to} = useWatch({control});
	const {data = []} = trpc.internal.dashboard.useQuery({from, to});

	function calculateValue(value: number, harga: number, unit: string) {
		const val = numberFormat(value * (calculated ? harga : 1), !!calculated);
		return `${val} ${calculated ? '' : unit}`;
	}

	return (
		<RootTable>
			<tr>
				<BorderTd>Jumlah PO</BorderTd>
				<BorderTd>SJ Masuk</BorderTd>
				<BorderTd>Barang Keluar</BorderTd>
				<BorderTd>Stock</BorderTd>
			</tr>
			{data.map(po => {
				return (
					<>
						{po.result.map(item => {
							const {totalIn, totalOut, totalStock, totalPo, unit, harga} =
								item;
							return (
								<tr key={item.item.id}>
									<BorderTd>{calculateValue(totalPo, harga, unit)}</BorderTd>
									<BorderTd>{calculateValue(totalIn, harga, unit)}</BorderTd>
									<BorderTd>{calculateValue(totalOut, harga, unit)}</BorderTd>
									<BorderTd>{calculateValue(totalStock, harga, unit)}</BorderTd>
								</tr>
							);
						})}
					</>
				);
			})}
		</RootTable>
	);
}

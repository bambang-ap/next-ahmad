import {FormType} from 'pages/app/internal';
import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {RootTable} from '@components';
import {MenuColorClass} from '@enum';
import {Td} from '@pageComponent/dashboard/Main/QtyTable';
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
				<Td className="text-white" rootClassName="bg-gray-600">
					Jumlah PO
				</Td>
				<Td className="text-white" rootClassName="bg-gray-600">
					SJ Masuk
				</Td>
				<Td className="text-white" rootClassName="bg-gray-600">
					Barang Keluar
				</Td>
				<Td className="text-white" rootClassName="bg-gray-600">
					Stock
				</Td>
			</tr>
			{data.map(po => {
				return (
					<>
						{po.result.map(item => {
							const {totalIn, totalOut, totalStock, totalPo, unit, harga} =
								item;
							return (
								<tr key={item.item.id}>
									<Td className="text-white" rootClassName={MenuColorClass.PO}>
										{calculateValue(totalPo, harga, unit)}
									</Td>
									<Td
										className="text-white"
										rootClassName={MenuColorClass.SJIn}>
										{calculateValue(totalIn, harga, unit)}
									</Td>
									<Td
										className="text-white"
										rootClassName={MenuColorClass.SJOut}>
										{calculateValue(totalOut, harga, unit)}
									</Td>
									<Td className="text-white" rootClassName={MenuColorClass.QC}>
										{calculateValue(totalStock, harga, unit)}
									</Td>
								</tr>
							);
						})}
					</>
				);
			})}
		</RootTable>
	);
}

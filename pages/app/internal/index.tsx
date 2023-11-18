import {BorderTd, RootTable} from '@components';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

Internal.getLayout = getLayout;

export default function Internal() {
	const {data = []} = trpc.internal.dashboard.useQuery();

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
							const {totalIn, totalOut, totalStock, totalPo, unit} = item;
							return (
								<tr key={item.item.id}>
									<BorderTd>
										{totalPo} {unit}
									</BorderTd>
									<BorderTd>
										{totalIn} {unit}
									</BorderTd>
									<BorderTd>
										{totalOut} {unit}
									</BorderTd>
									<BorderTd>
										{totalStock} {unit}
									</BorderTd>
								</tr>
							);
						})}
					</>
				);
			})}
		</RootTable>
	);
}

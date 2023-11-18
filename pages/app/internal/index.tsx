import {BorderTd, RootTable} from '@components';
import {getLayout} from '@hoc';
import {numberFormat} from '@utils';
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
										{numberFormat(totalPo, false)} {unit}
									</BorderTd>
									<BorderTd>
										{numberFormat(totalIn, false)} {unit}
									</BorderTd>
									<BorderTd>
										{numberFormat(totalOut, false)} {unit}
									</BorderTd>
									<BorderTd>
										{numberFormat(totalStock, false)} {unit}
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

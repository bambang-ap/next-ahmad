import {Gallery} from '@baseComps/Gallery';
import {qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

export default function MachineDashboard() {
	const {data} = trpc.dashboard.machine.list.useQuery();

	return (
		<>
			<Gallery
				columns={5}
				data={entries(data)}
				renderItem={({item: [, item]}) => {
					const {nomor_mesin, dKatMesin} = item.mesin;

					return (
						<div className="flex flex-col border-2 border-black">
							<div className="px-4 py-2 text-center flex-1 font-bold text-md">
								{dKatMesin.name} - {nomor_mesin}
							</div>
							<div className="border border-black" />
							{qtyMap(({qtyKey, unitKey}) => {
								const {planning, produksi, unit} = item.data;
								const qtyPlanning = planning[qtyKey];
								const qtyProduksi = produksi[qtyKey];

								if (!qtyPlanning) return null;

								return (
									<div className="flex flex-1 justify-center py-2">
										<div className="w-full px-4">
											<div className="text-left font-bold text-2xl">
												{qtyPlanning} {unit[unitKey]}
											</div>
											<div className="text-right font-bold text-2xl">
												{qtyProduksi} {unit[unitKey]}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					);
				}}
			/>
		</>
	);
}

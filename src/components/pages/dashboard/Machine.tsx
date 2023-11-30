import {useRecoilValue} from 'recoil';

import {Gallery} from '@baseComps/Gallery';
import {useTickerText} from '@hooks';
import {atomIsMobile} from '@recoil/atoms';
import {qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

export default function MachineDashboard() {
	const {data, isFetching} = trpc.dashboard.machine.list.useQuery();
	const {isLoadingText} = useTickerText(isFetching);

	const isMobile = useRecoilValue(atomIsMobile);

	const machineData = entries(data);

	if (isFetching) return <div>{isLoadingText}</div>;

	if (machineData.length <= 0) {
		return <div>Noting to see here, please insert a data</div>;
	}

	return (
		<>
			<Gallery
				columns={isMobile ? 1 : 5}
				data={machineData}
				renderItem={({item: [, item]}) => {
					const {nomor_mesin, dKatMesin} = item.mesin ?? {};

					return (
						<div className="flex flex-col border-2 border-black">
							<div className="px-4 py-2 text-center flex-1 font-bold text-md">
								{dKatMesin?.name} - {nomor_mesin}
							</div>
							<div className="flex justify-between px-4 py-2">
								<div className="text-xl font-bold">Planning</div>
								<div className="text-xl font-bold">Produksi</div>
							</div>
							<div className="border border-black" />
							{qtyMap(({num, qtyKey, unitKey}) => {
								const {planning, produksi, unit} = item.data;
								const qtyPlanning = planning[qtyKey];
								const qtyProduksi = produksi[qtyKey];

								if (num === 1) return null;

								if (!qtyPlanning || qtyPlanning == 0) return null;

								return (
									<div className="flex flex-1 justify-center py-2">
										<div className="w-full px-4">
											<div className="text-left font-bold text-xl">
												{qtyPlanning?.toFixed(2)} {unit[unitKey]}
											</div>
											<div className="text-right font-bold text-xl">
												{qtyProduksi?.toFixed(2)} {unit[unitKey]}
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

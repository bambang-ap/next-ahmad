import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {Gallery} from '@baseComps/Gallery';
import {useTickerText} from '@hooks';
import {atomIsMobile} from '@recoil/atoms';
import {classNames, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

import {J} from '.';

export default function MachineDashboard({control}: FormProps<J>) {
	const {
		filterFrom,
		filterTo,
		qtyKey: qtyKeySelected = [],
	} = useWatch({control});

	const {data: summaryData} = trpc.dashboard.machine.summary.useQuery({
		filterFrom,
		filterTo,
	});
	const {data, isFetching} = trpc.dashboard.machine.list.useQuery({
		filterFrom,
		filterTo,
	});
	const {isLoadingText} = useTickerText(isFetching);

	const isMobile = useRecoilValue(atomIsMobile);

	const machineData = entries(data);

	if (isFetching) return <div>{isLoadingText}</div>;

	if (machineData.length <= 0) {
		return <div>Noting to see here, please insert a data</div>;
	}

	return (
		<>
			<div className={classNames('flex gap-2', {'flex-col': isMobile})}>
				{qtyMap(({num, qtyKey}) => {
					const unitList = entries(summaryData?.[qtyKey]);

					if (!qtyKeySelected.includes(num)) return null;

					return (
						<div className="border-2 border-black flex-1">
							<div className="pb-2 px-4 border-b-2 border-b-black font-bold text-xl text-center">
								Total Qty {num}
							</div>
							{unitList.map(ee => {
								const [unit, qty] = ee ?? [];

								// @ts-ignore
								if (unit === 'null') return null;

								return (
									<>
										<div className="pb-2 px-4 flex justify-between">
											<div className="font-bold text-xl">{unit}</div>
											<div className="font-bold text-xl">{qty?.[0]}</div>
										</div>
									</>
								);
							})}
						</div>
					);
				})}
			</div>

			<div className="border-b-gray-300 border-b-2 w-full my-4" />

			<Gallery
				columns={isMobile ? 1 : 6}
				spacing={isMobile ? 0 : 0}
				data={machineData}
				renderItem={({item: [, item], Col}, i) => {
					const {nomor_mesin /* dKatMesin */} = item.mesin ?? {};

					return (
						<Col className={classNames('p-1', {'mb-2': isMobile})}>
							<div
								className={classNames('flex flex-col border-2 border-black')}>
								<div className="px-4 py-2 text-center flex-1 font-bold text-xs border-b-2 border-black">
									{/* {dKatMesin?.name} -  */}
									{nomor_mesin}
								</div>
								{/* <div className="flex justify-between px-4 py-2">
								<div className="text-xl font-bold">Planning</div>
								<div className="text-xl font-bold">Produksi</div>
							</div> */}

								{qtyMap(({num, qtyKey, unitKey}) => {
									const {planning, produksi, unit} = item.data;
									const qtyPlanning = planning[qtyKey] ?? 0;
									const qtyProduksi = produksi[qtyKey] ?? 0;

									const plan1 = planning.qty1;

									if (!qtyKeySelected.includes(num)) return null;

									if (!plan1 && (!qtyPlanning || qtyPlanning == 0)) return null;

									return (
										<div className="flex flex-1 justify-center px-2 py-1">
											<div className="w-full px-4">
												{/* <div className="text-left font-bold text-xl">
												{qtyPlanning?.toFixed(2)} {unit[unitKey]}
											</div> */}
												<div className="w-full text-center font-bold text-base">
													{qtyProduksi?.toFixed(2)} {unit[unitKey]}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</Col>
					);
				}}
			/>
		</>
	);
}

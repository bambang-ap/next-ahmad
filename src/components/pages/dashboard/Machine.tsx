import {ReactNode, useMemo} from 'react';

import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps, TItemUnit} from '@appTypes/app.type';
import {Gallery} from '@baseComps/Gallery';
import {decimalValue} from '@constants';
import {MenuColorClass} from '@enum';
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
	const colorClass = entries(MenuColorClass);

	const machineData = entries(data);
	const totalSummary = useMemo(() => {
		const total = {} as Record<TItemUnit, [number, number]>;

		qtyMap(({num, qtyKey}) => {
			const unitList = entries(summaryData?.[qtyKey]);

			for (const kk of unitList) {
				const [unit, qty] = kk!;

				if (!total[unit]) total[unit] = [0, 0];
				if (qtyKeySelected.includes(num)) {
					total[unit][0] += qty?.[0] ?? 0;
					total[unit][1] += qty?.[1] ?? 0;
				}
			}
		});

		return total;
	}, [qtyKeySelected, summaryData]);

	const total = entries(totalSummary).filter(([, b]) => !!b[0] && !!b[1]);

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

					const [, bgColor] = colorClass[num]!;

					return (
						<TotalQty
							className={bgColor}
							title={`Total Qty ${num}`}
							renderItem={Item => {
								return unitList.map(ee => {
									const [unit, qty] = ee ?? [];

									// @ts-ignore
									if (unit === 'null') return null;

									return <Item key={unit} unit={unit} qty={qty?.[0]} />;
								});
							}}
						/>
					);
				})}

				{total.length > 0 && (
					<TotalQty
						className={MenuColorClass.FG}
						title="Total Qty"
						renderItem={Item => {
							return total.map(ee => {
								const [unit, qtys] = ee ?? [];
								const qty = qtys?.[0];
								// @ts-ignore
								if (unit === 'null' || qty == 0) return null;

								return <Item key={unit} unit={unit} qty={qty} />;
							});
						}}
					/>
				)}
			</div>

			<div className="border-b-gray-300 border-b-2 w-full my-4" />

			<Gallery
				columns={isMobile ? 1 : 6}
				spacing={isMobile ? 0 : 0}
				data={machineData}
				renderItem={({item: [, item], Col}) => {
					const {nomor_mesin} = item.mesin ?? {};
					const [, bgColor] =
						colorClass[Math.randomInt(0, colorClass.length - 1)]!;

					return (
						<Col className={classNames('p-1 ', {'mb-2': isMobile})}>
							<TotalQty
								small
								className={bgColor}
								title={nomor_mesin!}
								renderItem={Item => {
									return qtyMap(({num, qtyKey, unitKey}) => {
										const {planning, produksi, unit} = item.data;
										const qtyPlanning = planning[qtyKey] ?? 0;
										const qtyProduksi = produksi[qtyKey] ?? 0;

										const plan1 = planning.qty1;
										const prod1 = produksi.qty1;

										if (!qtyKeySelected.includes(num)) return null;

										if (!plan1 && (!qtyPlanning || qtyPlanning == 0))
											return null;
										if (!prod1 && (!qtyProduksi || qtyProduksi == 0))
											return null;

										return <Item unit={unit[unitKey]!} qty={qtyProduksi} />;
									});
								}}
							/>
						</Col>
					);
				}}
			/>
		</>
	);
}

type TotalQtyProps = {
	className?: string;
	title: string;
	small?: boolean;
	renderItem: (
		callback: (Item: {unit: TItemUnit; qty?: number}) => JSX.Element,
	) => ReactNode;
};

function TotalQty({title, className, renderItem, small}: TotalQtyProps) {
	const asd = classNames('font-bold text-xl text-white', {'text-base': small});

	return (
		<div className={classNames('border-2 border-black flex-1', className)}>
			<div
				className={classNames(
					'py-2 px-4 mb-2',
					'border-b-2 border-b-black',
					'font-bold text-white text-xl text-center',
					{'!text-sm': small},
				)}>
				{title}
			</div>
			{renderItem(({unit, qty}) => (
				<div className="pb-2 px-4 flex justify-between">
					<div className={asd}>{unit}</div>
					<div className={asd}>{qty?.toFixed(decimalValue)}</div>
				</div>
			))}
		</div>
	);
}

import {Moment} from 'moment';
import {Control, useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {
	FormProps,
	TDashboardView,
	TKategoriMesin,
	TMesin,
	UQty,
} from '@appTypes/app.type';
import {TMachineFilter} from '@appTypes/app.zod';
import {
	ButtonGroup,
	MultipleButtonGroup,
	Select,
	selectMapper,
	selectMapperV2,
} from '@components';
import {BtnGroupQty, DashboardSelectView} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {UseDateFilterProps, useFormFilter} from '@hooks';
import {atomIsMobile} from '@recoil/atoms';
import {classNames} from '@utils';
import {trpc} from '@utils/trpc';

import BarChart from './BarChart';
import MachineDashboard from './Machine';
import MachineChart from './MachineChart';
import MachineDaily from './MachineDaily';
import MainDashboard from './Main';
import TotalCount from './TotalCount';

export type J = UseDateFilterProps<
	TMachineFilter & {
		view: TDashboardView;
		qtyKey: UQty[];
	}
>;
export type JJ = {days: string[]; daysSelectedDate: Moment};

export default function Dashboard() {
	const {
		days,
		fromToComponent,
		daysSelectedDate,
		monthYearComponent,
		form: {control, watch},
	} = useFormFilter<J>(true, {
		defaultValues: {qtyKey: [2, 3]},
	});
	const {view} = watch();

	const isMobile = useRecoilValue(atomIsMobile);

	const isMachine = view === 'machine';
	const isMachineChart = view === 'machine_chart';
	const isMachineDaily = view === 'machine_daily';

	return (
		<div className="flex flex-col">
			<div
				className={classNames('flex gap-2 items-center justify-between mb-4', {
					'flex-col': isMobile,
					'h-20': !isMobile,
				})}>
				<div className="flex-1">
					<ButtonGroup
						wrapped={isMobile}
						className="flex-1"
						fieldName="view"
						control={control}
						data={DashboardSelectView}
						defaultValue={DashboardSelectView?.[0]?.value}
					/>
				</div>
				{(isMachine || isMachineChart || isMachineDaily) && (
					<MultipleButtonGroup
						className={classNames({'w-full': isMobile})}
						control={control}
						fieldName="qtyKey"
						data={BtnGroupQty}
					/>
				)}

				<div
					className={classNames('flex gap-2 justify-end', {
						'w-1/3': !isMobile && (isMachine || isMachineDaily),
						'w-full': isMobile,
					})}>
					{isMachine && fromToComponent}
					{isMachineDaily && monthYearComponent}
				</div>
			</div>

			{(isMachineChart || isMachineDaily) && (
				<RenderMachineFilter control={control} />
			)}

			<RenderView
				days={days}
				control={control}
				daysSelectedDate={daysSelectedDate}
			/>
		</div>
	);
}

function RenderMachineFilter({control}: FormProps<J>) {
	const {machineCatId} = useWatch({control});

	const {data: dataCat} = trpc.basic.get.useQuery<any, TKategoriMesin>({
		target: CRUD_ENABLED.MESIN_KATEGORI,
	});
	const {data: dataMesin} = trpc.basic.get.useQuery<any, TMesin>(
		{
			target: CRUD_ENABLED.MESIN,
			where: JSON.stringify({kategori_mesin: machineCatId} as TMesin),
		},
		{enabled: !!machineCatId},
	);

	return (
		<div className="flex gap-2 mb-4">
			<Select
				label="Kategori Mesin"
				className="flex-1"
				control={control}
				fieldName="machineCatId"
				firstOption="Semua"
				data={selectMapper(dataCat ?? [], 'id', 'name')}
			/>
			<Select
				label="Mesin"
				className="flex-1"
				control={control}
				fieldName="machineId"
				firstOption="Semua"
				data={selectMapperV2(dataMesin ?? [], 'id', {
					labels: ['nomor_mesin', 'name'],
				})}
			/>
		</div>
	);
}

function RenderView({
	days,
	control,
	daysSelectedDate,
}: JJ & {control: Control<J>}) {
	const {view} = useWatch({control});

	switch (view) {
		case 'main':
			return <MainDashboard />;
		case 'bar':
			return <BarChart />;
		case 'line':
			return <BarChart type="line" />;
		case 'machine':
			return <MachineDashboard control={control} />;
		case 'machine_chart':
			return <MachineChart control={control} />;
		case 'machine_daily':
			return (
				<MachineDaily
					days={days}
					control={control}
					daysSelectedDate={daysSelectedDate}
				/>
			);
		default:
			return <TotalCount />;
	}
}

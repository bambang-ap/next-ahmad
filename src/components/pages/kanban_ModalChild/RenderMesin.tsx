import {createContext, useContext, useEffect} from 'react';

import {KanbanFormType} from 'pages/app/kanban';
import {
	Control,
	FieldPath,
	useForm,
	UseFormReset,
	useWatch,
} from 'react-hook-form';

import {TMasterItem} from '@appTypes/app.type';
import {Form, Select, selectMapper} from '@components';
import {ProcessForm, RenderProcess} from '@pageComponent/item/RenderProcess';
import {classNames} from '@utils';
import {trpc} from '@utils/trpc';

type RenderMesinProps = {
	disabled?: boolean;
	masterId: string;
	idItem: string;
	control: Control<KanbanFormType>;
	reset: UseFormReset<KanbanFormType>;
};

const RenderMesinContext = createContext(false);

export function RenderMesin(props: RenderMesinProps) {
	const {masterId, disabled = false} = props;
	const {data} = trpc.item.detail.useQuery(masterId);

	return (
		<RenderMesinContext.Provider value={disabled}>
			{data?.kategori_mesinn?.map((mesinKategori, i) => {
				return (
					<>
						<RenderKategori
							index={i}
							itemDetail={data}
							parentProps={props}
							katMesin={mesinKategori}
						/>
					</>
				);
			})}
		</RenderMesinContext.Provider>
	);
}

export function RenderKategori({
	index,
	katMesin,
	itemDetail,
	parentProps,
}: {
	index: number;
	katMesin: string;
	itemDetail: TMasterItem;
	parentProps: RenderMesinProps;
}) {
	const isDisabled = useContext(RenderMesinContext);
	const name: FieldPath<KanbanFormType> = `list_mesin.${parentProps.idItem}.${index}`;
	const hasSelected = useWatch({control: parentProps.control, name});

	const {control, reset} = useForm<ProcessForm>();
	const {data: availableMesins = []} =
		trpc.kanban.availableMesins.useQuery(katMesin);

	useEffect(() => {
		if (!!itemDetail?.instruksi) reset({instruksi: itemDetail.instruksi});
	}, [!!itemDetail?.instruksi]);

	return (
		<div className="flex gap-2">
			<Select
				label="Mesin"
				fieldName={name}
				disabled={isDisabled}
				control={parentProps.control}
				className={classNames('w-1/6', {'mt-4': !!hasSelected})}
				data={selectMapper(availableMesins, 'id', 'nomor_mesin')}
			/>
			{!!hasSelected && (
				<Form className="flex-1" context={{hideButton: true, disabled: true}}>
					<RenderProcess idKat={katMesin} control={control} reset={reset} />
				</Form>
			)}
		</div>
	);
}

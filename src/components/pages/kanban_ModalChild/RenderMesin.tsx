import {useEffect} from "react";

import {FormType} from "pages/app/kanban";
import {Control, useForm, UseFormReset, useWatch} from "react-hook-form";

import {ItemDetail} from "@appTypes/props.type";
import {Button, Form, Select, selectMapper} from "@components";
import {ProcessForm, RenderProcess} from "@pageComponent/item/RenderProcess";
import {trpc} from "@utils/trpc";

type RenderMesinProps = {
	masterId: string;
	idItem: string;
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
};

export function RenderMesin({
	masterId,
	control,
	reset,
	idItem,
}: RenderMesinProps) {
	const [listMesins] = useWatch({control, name: ["list_mesin"]});
	const {data: itemDetail} = trpc.kanban.itemDetail.useQuery<any, ItemDetail>(
		masterId,
	);

	const listMesin = listMesins[idItem];

	function deleteMesin(index: number) {
		reset(({list_mesin, ...prev}) => {
			const asd = list_mesin[idItem]!;

			if (asd.length <= 1) {
				alert("Minimal ada 1 mesin");
				return {...prev, list_mesin};
			}

			return {
				...prev,
				list_mesin: {
					...list_mesin,
					[idItem]: asd.remove(index),
				},
			};
		});
	}

	return (
		<>
			{listMesin?.map((mesin, i) => {
				return (
					<>
						<div className="flex flex-row gap-2">
							<div className="flex items-start w-1/6 gap-2">
								<Select
									key={mesin}
									className="flex-1"
									control={control}
									fieldName={`list_mesin.${idItem}.${i}`}
									data={selectMapper(
										itemDetail?.availableMesins ?? [],
										"id",
										"nomor_mesin",
									).filter(
										e =>
											e.value === listMesin[i] || !listMesin.includes(e.value),
									)}
								/>
								<Button onClick={() => deleteMesin(i)}>Delete</Button>
							</div>
							<div className="flex-1">
								<Asd itemDetail={itemDetail} />
							</div>
						</div>
					</>
				);
			})}
		</>
	);
}

function Asd({itemDetail}: {itemDetail: ItemDetail}) {
	const {control, reset} = useForm<ProcessForm>();

	useEffect(() => {
		if (!!itemDetail?.instruksi) reset({instruksi: itemDetail.instruksi});
	}, [!!itemDetail?.instruksi]);

	return (
		<Form context={{hideButton: true, disabled: true}}>
			<RenderProcess control={control} reset={reset} />
		</Form>
	);
}

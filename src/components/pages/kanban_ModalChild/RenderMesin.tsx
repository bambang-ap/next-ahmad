import {FormType} from "pages/app/kanban";
import {Control, UseFormReset, useWatch} from "react-hook-form";

import {ItemDetail} from "@appTypes/props.type";
import {Button, Select, selectMapper} from "@components";
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
						<div className="flex gap-2 flex-1">
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
									e => e.value === listMesin[i] || !listMesin.includes(e.value),
								)}
							/>
							<Button onClick={() => deleteMesin(i)}>Delete</Button>
						</div>
					</>
				);
			})}
		</>
	);
}

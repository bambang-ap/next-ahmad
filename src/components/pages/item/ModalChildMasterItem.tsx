import {Control, UseFormReset, useWatch} from "react-hook-form";

import {
	ModalTypePreview,
	TKategoriMesin,
	TMasterItem,
} from "@appTypes/app.type";
import {Button, Input, Select, selectMapper, Text} from "@components";
import {CRUD_ENABLED} from "@enum";
import {trpc} from "@utils/trpc";

import {RenderProcess} from "./RenderProcess";

export type FormType = TMasterItem & {
	type: ModalTypePreview;
};

export function ModalChildMasterItem({
	control,
	reset,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const {data} = trpc.basic.get.useQuery<any, TKategoriMesin[]>({
		target: CRUD_ENABLED.MESIN_KATEGORI,
	});
	const modalType = useWatch({control, name: "type"});

	if (modalType === "delete") {
		return (
			<div>
				<Text>Hapus ?</Text>
				<Button type="submit">Ya</Button>
			</div>
		);
	}

	return (
		<>
			<Input control={control} fieldName="name" />
			<Input control={control} fieldName="kode_item" />
			<Select
				control={control}
				fieldName="kategori_mesin"
				data={selectMapper(data ?? [], "id", "name")}
			/>
			{/* FIXME: */}
			{/* @ts-ignore */}
			<RenderProcess control={control} reset={reset} />
			<Button type="submit">Submit</Button>
		</>
	);
}

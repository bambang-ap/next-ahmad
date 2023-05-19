import {Control, useForm, UseFormReset, useWatch} from "react-hook-form";

import {ModalTypePreview, TMasterItem} from "@appTypes/app.type";
import {Button, Input, Select, selectMapper, Text} from "@components";
import {CRUD_ENABLED} from "@enum";
import {trpc} from "@utils/trpc";

export type FormType = TMasterItem & {
	type: ModalTypePreview;
};

type ScopeForm = Record<
	"material" | "parameter" | "hardness" | "process",
	string
>;

export function ModalChildMasterItem({
	control,
	reset,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const {data: dataMaterial} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.MATERIAL,
	});
	const {data: dataParameter} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.PARAMETER,
	});
	const {data: dataHardness} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.HARDNESS,
	});
	const {data: dataProcess} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
	});

	const {
		watch,
		control: scopeControl,
		reset: resetDataSelect,
	} = useForm<ScopeForm>();
	const dataSelect = watch();
	const modalType = useWatch({control, name: "type"});
	const keys = [
		["material", dataMaterial, selectMapper(dataMaterial, "id", "name")],
		["parameter", dataParameter, selectMapper(dataParameter, "id", "name")],
		["hardness", dataHardness, selectMapper(dataHardness, "id", "name")],
		["process", dataProcess, selectMapper(dataProcess, "id", "name")],
	] as const;

	const listKey = useWatch({control, name: keys.map(e => e[0])});

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
			<div className="flex justify-between gap-2">
				{keys.map(([key, data, mappedData], index) => {
					const hasSelected = !!dataSelect[key];

					function addItem() {
						if (!hasSelected) return;

						resetDataSelect(prevSelect => {
							const u = prevSelect[key].slice();
							reset(({[key]: prevItem = [], ...prev}) => {
								return {...prev, [key]: [...prevItem, u]};
							});
							return {...prevSelect, [key]: ""};
						});
					}

					function removeItem(i: number) {
						reset(({[key]: prevItem = [], ...prev}) => {
							return {...prev, [key]: prevItem.remove(i)};
						});
					}

					return (
						<div className="flex-1 p-2 border rounded-md" key={key}>
							<div className="flex gap-2">
								<Select
									key={uuid()}
									label={key.ucwords()}
									className="flex-1"
									data={mappedData}
									control={scopeControl}
									fieldName={key}
								/>
								{hasSelected && <Button onClick={addItem} icon="faPlus" />}
							</div>
							<div className="flex flex-col gap-2">
								{listKey[index]?.map((id, i) => {
									// @ts-ignore
									const selectedItem = data.find(e => e.id === id);
									return (
										<div key={id} className="flex gap-2">
											<Text className="flex-1">{selectedItem?.name}</Text>
											<Button onClick={() => removeItem(i)} icon="faMinus" />
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>

			<Button type="submit">Submit</Button>
		</>
	);
}

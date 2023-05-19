import {Control, useWatch} from "react-hook-form";

import {Button, Input, Text} from "@components";

import {FormType} from "./";

export function ModalChild({control}: {control: Control<FormType>}) {
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

			<Button type="submit">Submit</Button>
		</>
	);
}

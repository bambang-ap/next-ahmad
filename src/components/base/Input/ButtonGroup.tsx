import {useContext} from "react";

import {ButtonGroup as BtnGroup} from "@mui/material";
import {FieldValues} from "react-hook-form";

import {Button} from "@components";
import {
	ControlledComponentProps,
	withReactFormController,
} from "@formController";

import {FormContext} from "../Form";
import {SelectProps} from "./Select";

export const ButtonGroup = withReactFormController(SelectComponent);

type HH = Pick<SelectProps, "data" | "disabled">;

function SelectComponent<F extends FieldValues>({
	data = [],
	disabled,
	controller,
	className,
}: ControlledComponentProps<F, HH>) {
	const formContext = useContext(FormContext);

	const {
		field: {value, onChange},
	} = controller;

	const isDisabled = formContext?.disabled || disabled;

	return (
		<BtnGroup variant="text" className={className}>
			{data.map(btn => {
				const label = btn.label ?? btn.value;
				const selectedValue = btn.value === value;

				return (
					<Button
						key={btn.value}
						disabled={isDisabled}
						onClick={() => onChange(btn.value)}
						color={selectedValue ? "primary" : undefined}>
						{label}
					</Button>
				);
			})}
		</BtnGroup>
	);
}

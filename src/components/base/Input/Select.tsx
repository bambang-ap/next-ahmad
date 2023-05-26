import {useContext} from "react";

import {Autocomplete, TextField} from "@mui/material";
import {FieldPath, FieldValues} from "react-hook-form";

import {defaultTextFieldProps} from "@constants";
import {
	ControlledComponentProps,
	withReactFormController,
} from "@formController";

import {FormContext} from "../Form";

export type SelectPropsData<T extends string = string> = {
	label?: string;
	value: T;
};

export type SelectProps = {
	firstOption?: string;
	disabled?: boolean;
	data?: SelectPropsData[];
	label?: string;
	noLabel?: boolean;
	disableClear?: boolean;
};

export const Select = withReactFormController(SelectComponent);

export function selectMapper<T extends FieldValues>(
	data: T[],
	value: FieldPath<T>,
	label?: FieldPath<T>,
) {
	// @ts-ignore
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return data?.map<SelectPropsData>(item => {
		function finder(path?: string) {
			if (!path) return undefined;

			return eval(`item?.${path.replace(/\./g, "?.")}`);
		}
		return {value: finder(value), label: label ? finder(label) : undefined};
	});
}

function SelectComponent<F extends FieldValues>({
	data = [],
	disabled,
	controller,
	disableClear,
	firstOption,
	className,
	noLabel,
	label: labelProps,
}: ControlledComponentProps<F, SelectProps>) {
	const formContext = useContext(FormContext);

	const {
		field: {value, onChange, name},
	} = controller;

	const label = !noLabel && (labelProps || name);

	const selectedValue = data.find(e => e.value === value);

	return (
		<div className={className}>
			<Autocomplete
				disableClearable={disableClear}
				disablePortal
				options={data}
				disabled={formContext?.disabled ?? disabled}
				defaultValue={selectedValue}
				onChange={(_, option) => onChange(option?.value)}
				getOptionDisabled={({value: OptDisabledValue}) => !OptDisabledValue}
				getOptionLabel={({value: optionValue, label: optionLabel}) =>
					optionLabel || optionValue
				}
				renderInput={params => (
					<TextField
						{...params}
						{...defaultTextFieldProps}
						label={label}
						placeholder={firstOption}
						sx={{
							"& .MuiInputBase-input.Mui-disabled": {
								WebkitTextFillColor: "#000000",
							},
						}}
					/>
				)}
			/>
		</div>
	);
}

import {useContext} from "react";

import {Autocomplete, TextField} from "@mui/material";
import {FieldPath, FieldValues} from "react-hook-form";

import {defaultTextFieldProps} from "@constants";
import {
	ControlledComponentProps,
	withReactFormController,
} from "@formController";
import {classNames} from "@utils";

import {InputComponent} from "..";

import {FormContext} from "../../Form";

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

export function selectMapper<T extends FieldValues, P extends FieldPath<T>>(
	data: T[],
	value: P | P[] | [string, P][],
	label: P | P[] | [string, P][],
) {
	// @ts-ignore
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return data?.map<SelectPropsData>(item => {
		function finder(path?: string) {
			if (!path) return undefined;

			return eval(`item?.${path.replace(/\./g, "?.")}`);
		}

		function finderY(pathValue: P | P[] | [string, P][]) {
			if (!Array.isArray(pathValue)) return finder(pathValue);
			else {
				return pathValue
					.map(val => {
						if (Array.isArray(val)) {
							const [k, v] = val;
							return `${k} : ${finder(v)}`;
						}

						return finder(val);
					})
					.filter(Boolean)?.[0];
			}
		}

		return {value: finderY(value), label: label ? finderY(label) : undefined};
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

	const isDisabled = formContext?.disabled || disabled;
	const selectedValue = data.find(e => e.value === value);

	if (isDisabled) {
		return (
			<InputComponent
				disabled
				byPassValue={selectedValue?.label}
				noLabel={noLabel}
				label={label as string}
				controller={controller}
				className={className}
			/>
		);
	}

	return (
		<div className={classNames("pt-2", className)}>
			<Autocomplete
				disableClearable={disableClear}
				disablePortal
				options={data}
				disabled={isDisabled}
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

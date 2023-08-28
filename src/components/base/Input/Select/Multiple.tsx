import {useContext} from "react";

import {FormContext} from "@baseComps/Form";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {Autocomplete, Checkbox, Chip, TextField} from "@mui/material";
import {FieldValues} from "react-hook-form";

import {InputComponent} from "@components";
import {defaultTextFieldProps} from "@constants";
import {
	ControlledComponentProps,
	withReactFormController,
} from "@formController";
import {classNames} from "@utils";

import {SelectProps, SelectPropsData} from "./Select";

export const MultipleSelect = withReactFormController(MultipleSelectComponent);
function MultipleSelectComponent<F extends FieldValues>({
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
		field: {value: val = [], onChange, name},
	} = controller;

	const value = val as string[];
	const label = !noLabel && (labelProps || name);

	const isDisabled = formContext?.disabled ?? disabled;
	const selectedValue = data.filter(e => value.includes(e.value));
	const selectedValues = selectedValue.map(e => e.value);

	const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
	const checkedIcon = <CheckBoxIcon fontSize="small" />;

	function onClick(option: SelectPropsData) {
		onChange(
			selectedValues.includes(option.value)
				? selectedValues.filter(e => e !== option.value)
				: selectedValues.concat([option.value]),
		);
	}

	if (isDisabled) {
		return (
			<InputComponent
				disabled
				byPassValue={selectedValue.map(e => e.label || e.value).join(" | ")}
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
				multiple
				disableClearable={disableClear}
				disablePortal
				disableCloseOnSelect
				options={data}
				disabled={isDisabled}
				value={selectedValue}
				getOptionDisabled={({value: OptDisabledValue}) => !OptDisabledValue}
				getOptionLabel={({value: optionValue, label: optionLabel}) =>
					optionLabel || optionValue
				}
				renderTags={(tagValue, getTagProps) =>
					tagValue.map((option, index) => (
						<Chip
							{...getTagProps({index})}
							label={option.label ?? option.value}
							key={index.toString()}
							onDelete={undefined}
						/>
					))
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
				renderOption={(props, option) => (
					<li
						{...props}
						onClick={e => {
							props?.onClick?.(e);
							onClick(option);
						}}>
						<Checkbox
							icon={icon}
							checkedIcon={checkedIcon}
							style={{marginRight: 8}}
							checked={selectedValues.includes(option.value)}
						/>
						{option.label || option.value}
					</li>
				)}
			/>
		</div>
	);
}

import {ChangeEventHandler, useContext, useEffect, useRef} from "react";

import {TextField, useTheme} from "@mui/material";
import {CalendarPicker} from "@mui/x-date-pickers";
import {AdapterMoment} from "@mui/x-date-pickers/AdapterMoment";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import moment from "moment";
import {FieldValues} from "react-hook-form";

import {FormContext, Icon, Modal, ModalRef, Text} from "@components";
import {
	decimalRegex,
	decimalSchema,
	defaultTextFieldProps,
	formatDate,
	formatDateView,
} from "@constants";
import {
	ControlledComponentProps,
	withReactFormController,
} from "@formController";
import {classNames} from "@utils";

import {CheckBox} from "./CheckBox";

export type InputProps = {
	byPassValue?: string;
	hidden?: boolean;
	placeholder?: string;
	label?: string;
	noLabel?: boolean;
	disabled?: boolean;
	multiline?: boolean;
	forceEditable?: boolean;
	type?:
		| "number"
		| "decimal"
		| "text"
		| "search"
		| "checkbox"
		| "password"
		| "date";
};

export const Input = withReactFormController(InputComponent);

export function InputComponent<F extends FieldValues>(
	props: ControlledComponentProps<F, InputProps>,
) {
	let restProps: MyObject<any> = {};
	const theme = useTheme();
	const {
		byPassValue,
		hidden,
		type = "text",
		label: labelProps,
		disabled,
		className,
		controller,
		placeholder,
		noLabel,
		defaultValue,
		rightAcc: endAdornment,
		leftAcc: startAdornment,
		appliedRules,
		multiline,
		forceEditable,
	} = props;

	const formContext = useContext(FormContext);
	const modalRef = useRef<ModalRef>(null);

	const {
		fieldState,
		field: {value, onChange, ...field},
	} = controller;

	const isDisabled = formContext?.disabled || disabled;
	const label = !noLabel && (labelProps || field.name);

	const errorMessage = fieldState.error?.message && (
		<Text className="text-red-700 flex items-center">
			<Icon name="faWarning" className="mr-2" />
			{fieldState.error?.message}
		</Text>
	);

	useEffect(() => {
		if (!value && !!defaultValue) setTimeout(() => onChange(defaultValue), 100);
	}, [value, defaultValue]);

	// if (isDisabled) {
	// 	return (
	// 		<div
	// 			className={classNames(
	// 				"flex flex-col",
	// 				"px-4 py-2",
	// 				"rounded-t-xl",
	// 				"border border-b-black",
	// 				className,
	// 			)}>
	// 			<Text className="text-sm">{label}</Text>
	// 			<Text>{value}</Text>
	// 		</div>
	// 	);
	// }

	switch (type) {
		case "date": {
			return (
				<div className={classNames("pt-2 cursor-pointer", className)}>
					<TextField
						{...defaultTextFieldProps}
						onClick={isDisabled ? undefined : () => modalRef.current?.show()}
						InputLabelProps={{
							...defaultTextFieldProps.InputLabelProps,
							// shrink: type === 'date' ? true : undefined,
						}}
						className="cursor-pointer w-full"
						error={!!errorMessage}
						fullWidth
						label={label}
						disabled
						sx={{
							"& .MuiInputBase-input.Mui-disabled": {
								WebkitTextFillColor: "#000000",
							},
							"& .MuiFormLabel-root.Mui-disabled": {
								WebkitTextFillColor: theme.colors.alpha.black[50],
							},
							"& .MuiInputBase-root.Mui-disabled": {
								backgroundColor: theme.colors.alpha.black[10],
							},
						}}
						placeholder={formatDateView}
						value={value ? moment(value).format(formatDateView) : undefined}
						InputProps={{
							startAdornment,
							endAdornment: <Icon name="faCalendar" />,
							classes: {input: "focus:bg-yellow"},
						}}
						{...restProps}
						{...field}
					/>
					<Modal ref={modalRef}>
						<LocalizationProvider dateAdapter={AdapterMoment}>
							<CalendarPicker
								date={moment(value)}
								allowSameDateSelection
								onChange={date => {
									modalRef.current?.hide();
									onChange(date?.format(formatDate));
								}}
							/>
						</LocalizationProvider>
					</Modal>
				</div>
			);
		}
		case "checkbox": {
			function onCheck() {
				onChange(!value);
			}

			return (
				<CheckBox
					label={label}
					value={value}
					hidden={hidden}
					onCheck={onCheck}
					className={className}>
					{errorMessage}
				</CheckBox>
			);
		}

		default: {
			const onChangeEvent: ChangeEventHandler<HTMLInputElement> = function (
				event,
			) {
				switch (type) {
					case "number":
						return onChange(parseInt(event.target.value));
					case "decimal":
						const strValue = event.target.value
							.toString()
							.replace(/[^0-9.]/g, "")
							.replace(/(?<=\..*)\./g, "");

						const parsed = decimalSchema.safeParse(strValue);

						if (parsed.success) return onChange(parsed.data);

						appliedRules?.({
							pattern: {
								message: `"${strValue}" is not a number format`,
								value: decimalRegex,
							},
						});
						return onChange(strValue);
					default:
						return onChange(event);
				}
			};

			return (
				<div className={classNames({hidden}, "pt-2", className)}>
					<TextField
						{...defaultTextFieldProps}
						multiline={multiline}
						InputLabelProps={{
							...defaultTextFieldProps.InputLabelProps,
							// shrink: type === 'date' ? true : undefined,
						}}
						error={!!errorMessage}
						fullWidth
						label={label}
						type={type}
						disabled={forceEditable ? false : isDisabled}
						sx={{
							"& .MuiInputBase-input.Mui-disabled": {
								WebkitTextFillColor: "#000000",
							},
						}}
						placeholder={placeholder}
						value={byPassValue ?? value ?? ""}
						onChange={onChangeEvent}
						InputProps={{
							endAdornment,
							startAdornment,
							classes: {input: "focus:bg-yellow"},
						}}
						{...restProps}
						{...field}
					/>
					{errorMessage}
				</div>
			);
		}
	}
}

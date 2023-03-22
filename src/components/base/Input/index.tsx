import {ChangeEventHandler, useEffect} from 'react';

import {TextField} from '@mui/material';
import {FieldValues} from 'react-hook-form';

import {Icon, Text} from '@components';
import {defaultTextFieldProps} from '@constants';
import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';
import {classNames} from '@utils';

export type InputProps = {
	placeholder?: string;
	label?: string;
	noLabel?: boolean;
	disabled?: boolean;
	type?: 'number' | 'text' | 'checkbox' | 'password' | 'date';
};

export const Input = withReactFormController(InputComponent);

function InputComponent<F extends FieldValues>(
	props: ControlledComponentProps<F, InputProps>,
) {
	let restProps: MyObject<any> = {};
	const {
		type,
		label: labelProps,
		disabled,
		className,
		controller,
		placeholder,
		noLabel,
		defaultValue,
		rightAcc: endAdornment,
		leftAcc: startAdornment,
	} = props;

	const {
		fieldState,
		field: {value, onChange, ...field},
	} = controller;

	const label = !noLabel && (labelProps || field.name);

	const errorMessage = fieldState.error?.message && (
		<Text className="text-app-secondary-03 flex items-center">
			<Icon name="faWarning" className="mr-2" />
			{fieldState.error?.message}
		</Text>
	);

	useEffect(() => {
		if (!value && !!defaultValue) setTimeout(() => onChange(defaultValue), 100);
	}, [value, defaultValue]);

	if (type === 'checkbox') {
		function onCheck() {
			onChange(!value);
		}

		return (
			<div
				className={classNames(
					`flex items-center cursor-pointer !px-0 !py-0`,
					className,
				)}
				onClick={onCheck}>
				<div className="flex justify-center items-center mr-2 border rounded h-6 w-6">
					{value && <Icon name="faCheck" />}
				</div>
				<Text>{label}</Text>
				{errorMessage}
			</div>
		);
	}

	const onChangeEvent: ChangeEventHandler<HTMLInputElement> = function (event) {
		switch (type) {
			case 'number':
				return onChange(parseInt(event.target.value));
			default:
				return onChange(event);
		}
	};

	return (
		<>
			<TextField
				{...defaultTextFieldProps}
				error={!!errorMessage}
				classes={{root: className}}
				fullWidth
				label={label}
				type={type}
				disabled={disabled}
				placeholder={placeholder}
				value={value ?? ''}
				onChange={onChangeEvent}
				InputProps={{endAdornment, startAdornment}}
				{...restProps}
				{...field}
			/>
			{errorMessage}
		</>
	);
}

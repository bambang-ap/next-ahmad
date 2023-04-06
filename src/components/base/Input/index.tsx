import {ChangeEventHandler, useContext, useEffect} from 'react';

import {TextField} from '@mui/material';
import {FieldValues} from 'react-hook-form';

import {FormContext, Icon, Text} from '@components';
import {defaultTextFieldProps} from '@constants';
import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';
import {classNames} from '@utils';

export type InputProps = {
	hidden?: boolean;
	placeholder?: string;
	label?: string;
	noLabel?: boolean;
	disabled?: boolean;
	type?: 'number' | 'text' | 'search' | 'checkbox' | 'password' | 'date';
};

export const Input = withReactFormController(InputComponent);

function InputComponent<F extends FieldValues>(
	props: ControlledComponentProps<F, InputProps>,
) {
	let restProps: MyObject<any> = {};
	const {
		hidden,
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

	const formContext = useContext(FormContext);

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
					{hidden},
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
		<div className={classNames({hidden}, className)}>
			<TextField
				{...defaultTextFieldProps}
				error={!!errorMessage}
				fullWidth
				label={label}
				type={type}
				disabled={formContext?.disabled ?? disabled}
				sx={{
					'& .MuiInputBase-input.Mui-disabled': {
						WebkitTextFillColor: '#000000',
					},
				}}
				placeholder={placeholder}
				value={value ?? ''}
				onChange={onChangeEvent}
				InputProps={{
					endAdornment,
					startAdornment,
					classes: {input: 'focus:bg-yellow'},
				}}
				{...restProps}
				{...field}
			/>
			{errorMessage}
		</div>
	);
}

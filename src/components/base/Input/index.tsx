import React from 'react';

import {FieldValues} from 'react-hook-form';
import {
	ControlledComponentProps,
	withReactFormController,
} from 'src/hoc/withReactFormController';

export type InputProps = {
	className?: string;
	placeholder?: string;
	type?: 'text' | 'checkbox';
	label?: string;
};

export const Input = withReactFormController(InputComponent);

export * from './Select';

function InputComponent<F extends FieldValues>(
	props: ControlledComponentProps<F, InputProps>,
) {
	const {controller, type, label, placeholder, className} = props;

	const {
		fieldState,
		field: {value, ...field},
	} = controller;

	const errorMessage = <label>{fieldState.error?.message}</label>;

	if (type === 'checkbox') {
		function onCheck() {
			field.onChange(!value);
		}

		return (
			<div className={`${className}`} onClick={onCheck}>
				<input {...field} type="checkbox" checked={value} onClick={onCheck} />
				<label>{label}</label>
				{errorMessage}
			</div>
		);
	}

	return (
		<>
			<input
				type="text"
				placeholder={placeholder}
				className={`${className}`}
				{...field}
			/>
			{errorMessage}
		</>
	);
}

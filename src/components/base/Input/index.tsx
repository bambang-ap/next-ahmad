import React, {HTMLInputTypeAttribute} from 'react';

import {FieldValues} from 'react-hook-form';
import {
	ControlledComponentProps,
	withReactFormController,
} from 'src/hoc/withReactFormController';

type Props<F extends FieldValues> = ControlledComponentProps<F> & InputProps;

function InputComponent<F extends FieldValues>(props: Props<F>) {
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

export type InputProps = {
	className?: string;
	placeholder?: string;
	type?: HTMLInputTypeAttribute;
	label?: string;
};
export const Input = withReactFormController(InputComponent);

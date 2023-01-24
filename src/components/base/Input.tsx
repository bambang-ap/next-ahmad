import React from 'react';

import {FieldValues} from 'react-hook-form';
import {
	ControlledComponentProps,
	withReactFormController,
} from 'src/hoc/withReactFormController';

type Props<F extends FieldValues> = ControlledComponentProps<F> & InputProps;

function InputComponent<F extends FieldValues>(props: Props<F>) {
	const {controller, placeholder, className} = props;

	const {field, fieldState} = controller ?? {};

	return (
		<>
			<input placeholder={placeholder} className={`${className}`} {...field} />
			{fieldState?.error?.message}
		</>
	);
}

export type InputProps = {className?: string; placeholder?: string};
export const Input = withReactFormController(InputComponent);

import {FieldValues} from 'react-hook-form';

import {Icon} from '@components';
import {focusInputClassName, inputClassName} from '@constants';
import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';

export type InputProps = {
	className?: string;
	placeholder?: string;
	type?: 'text' | 'checkbox';
	label?: string;
	editable?: boolean;
};

export const Input = withReactFormController(InputComponent);

function InputComponent<F extends FieldValues>(
	props: ControlledComponentProps<F, InputProps>,
) {
	const {
		type,
		label,
		className,
		controller,
		placeholder,
		editable = true,
	} = props;

	const {
		fieldState,
		field: {value, ...field},
	} = controller;

	const errorMessage = fieldState.error?.message && (
		<label className="text-app-secondary-03 flex items-center">
			<Icon name="faWarning" className="mr-2" />
			{fieldState.error?.message}
		</label>
	);

	if (type === 'checkbox') {
		function onCheck() {
			field.onChange(!value);
		}

		return (
			<div className={`cursor-pointer ${className}`} onClick={onCheck}>
				<input
					{...field}
					className="focus:outline-none"
					type="checkbox"
					checked={value}
					onClick={onCheck}
				/>
				<label>{label}</label>
				{errorMessage}
			</div>
		);
	}

	return (
		<div className="pb-2">
			<label>{label}</label>
			<div className={`${className} ${inputClassName} ${focusInputClassName}`}>
				<input
					placeholder={placeholder}
					className="focus:outline-none w-full"
					value={value}
					{...field}
				/>
			</div>
			{errorMessage}
		</div>
	);
}

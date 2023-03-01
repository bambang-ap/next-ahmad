import {ChangeEventHandler} from 'react';

import {TextInput as InputFlowbite} from 'flowbite-react';
import {FieldValues} from 'react-hook-form';

import {Icon, Text} from '@components';
import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';
import {classNames} from '@utils';

export type InputProps = {
	className?: string;
	placeholder?: string;
	type?: 'text' | 'checkbox' | 'number' | 'password';
	label?: string;
	disabled?: boolean;
};

export const Input = withReactFormController(InputComponent);

function InputComponent<F extends FieldValues>(
	props: ControlledComponentProps<F, InputProps>,
) {
	const {type, label, disabled, className, controller, placeholder} = props;

	const {
		fieldState,
		field: {value, onChange, ...field},
	} = controller;

	const errorMessage = fieldState.error?.message && (
		<Text className="text-app-secondary-03 flex items-center">
			<Icon name="faWarning" className="mr-2" />
			{fieldState.error?.message}
		</Text>
	);

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
		if (type === 'number') return onChange(parseInt(event.target.value));
		return onChange(event);
	};

	return (
		<div className={className}>
			{label && <Text className="mb-2">{label}</Text>}
			<InputFlowbite
				type={type}
				disabled={disabled}
				placeholder={placeholder || field.name}
				value={value}
				onChange={onChangeEvent}
				{...field}
			/>
			{errorMessage}
		</div>
	);
}

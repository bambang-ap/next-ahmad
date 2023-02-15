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
	type?: 'text' | 'checkbox';
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
		field: {value, ...field},
	} = controller;

	const errorMessage = fieldState.error?.message && (
		<Text className="text-app-secondary-03 flex items-center">
			<Icon name="faWarning" className="mr-2" />
			{fieldState.error?.message}
		</Text>
	);

	if (type === 'checkbox') {
		function onCheck() {
			field.onChange(!value);
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

	return (
		<>
			{label && <Text className="mb-2">{label}</Text>}
			<InputFlowbite
				disabled={disabled}
				placeholder={placeholder}
				value={value}
				{...field}
			/>
			{errorMessage}
		</>
	);
}

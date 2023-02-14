import {TextInput as InputFlowbite} from 'flowbite-react';
import {FieldValues} from 'react-hook-form';

import {Icon, Text} from '@components';
import {focusInputClassName, inputClassName} from '@constants';
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
		<div className="flex">
			{label && <Text className="mb-2">{label}</Text>}
			<InputFlowbite placeholder={placeholder} value={value} {...field} />
			{errorMessage}
		</div>
	);

	return (
		<div className="pb-2">
			<Text>{label}</Text>
			<div
				className={classNames(className, inputClassName, focusInputClassName)}>
				<input
					className="bg-transparent focus:outline-none w-full"
					placeholder={placeholder}
					value={value}
					{...field}
				/>
			</div>
			{errorMessage}
		</div>
	);
}

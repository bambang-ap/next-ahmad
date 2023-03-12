import {Select as SelectFlowbite} from 'flowbite-react';
import {FieldValues} from 'react-hook-form';

import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';
import {classNames} from '@utils';

import {Text} from '../Text';

export type SelectPropsData<T extends string = string> = {
	label?: string;
	value: T;
};

export type SelectProps = {
	firstOption?: string;
	disabled?: boolean;
	data?: SelectPropsData[];
	label?: string;
	noLabel?: boolean;
};

export const Select = withReactFormController(SelectComponent);

export function selectMapper<T extends {}>(
	data: T[],
	value: keyof T,
	label?: keyof T,
) {
	return data?.map<SelectPropsData>(item => {
		return {value: item[value], label: label ? item[label] : undefined};
	});
}

function SelectComponent<F extends FieldValues>({
	data = [],
	disabled,
	controller,
	firstOption,
	className,
	noLabel,
	label: labelProps,
}: ControlledComponentProps<F, SelectProps>) {
	const {
		field: {value, onChange, name},
	} = controller;

	const label = !noLabel && (labelProps || name);

	return (
		<div className={classNames('flex flex-col', className)}>
			{label && <Text className="mb-2">{label}</Text>}
			<SelectFlowbite disabled={disabled} onChange={onChange} value={value}>
				{firstOption && (
					<option disabled value="" selected={!value}>
						{firstOption}
					</option>
				)}
				{data.map(({label, value: val}) => (
					<option key={val} value={val}>
						{label || val}
					</option>
				))}
			</SelectFlowbite>
		</div>
	);
}

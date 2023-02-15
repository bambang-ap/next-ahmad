import {Select as SelectFlowbite} from 'flowbite-react';
import {FieldValues} from 'react-hook-form';

import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';

export type SelectPropsData = Record<'label' | 'value', string>;

export type SelectProps = {
	firstOption?: string;
	disabled?: boolean;
	data: SelectPropsData[];
};

export const Select = withReactFormController(SelectComponent);

function SelectComponent<F extends FieldValues>({
	data,
	disabled,
	controller,
	firstOption,
}: ControlledComponentProps<F, SelectProps>) {
	const {
		field: {value, onChange},
	} = controller;

	return (
		<SelectFlowbite disabled={disabled} onChange={onChange} value={value}>
			{firstOption && (
				<option disabled value="" selected={!value}>
					{firstOption}
				</option>
			)}
			{data.map(({label, value: val}) => (
				<option key={val} value={val}>
					{label}
				</option>
			))}
		</SelectFlowbite>
	);
}

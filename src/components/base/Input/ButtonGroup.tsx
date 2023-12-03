import {useContext} from 'react';

import {ButtonGroup as BtnGroup} from '@mui/material';
import {FieldValues} from 'react-hook-form';

import {Button} from '@components';
import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';

import {FormContext} from '../Form';
import {SelectProps} from './Select';

export const ButtonGroup = withReactFormController(SelectComponent);
export const MultipleButtonGroup = withReactFormController(SelectComponent2);

type HH = Pick<SelectProps, 'data' | 'disabled'>;

function SelectComponent<F extends FieldValues>({
	data = [],
	disabled,
	controller,
	className,
}: ControlledComponentProps<F, HH>) {
	const formContext = useContext(FormContext);

	const {
		field: {value, onChange},
	} = controller;

	const isDisabled = formContext?.disabled || disabled;

	return (
		<BtnGroup variant="outlined" className={className}>
			{data.map(btn => {
				const label = btn.label ?? btn.value;
				const selectedValue = btn.value === value;

				return (
					<Button
						key={btn.value}
						disabled={isDisabled}
						onClick={() => onChange(btn.value)}
						color={selectedValue ? 'primary' : undefined}>
						{label}
					</Button>
				);
			})}
		</BtnGroup>
	);
}

function SelectComponent2<F extends FieldValues>({
	data = [],
	disabled,
	controller,
	className,
}: ControlledComponentProps<F, HH>) {
	const formContext = useContext(FormContext);

	const {
		field: {value: val = [], onChange},
	} = controller;
	const value = val as (string | number)[];
	const isDisabled = formContext?.disabled || disabled;

	return (
		<BtnGroup variant="outlined" className={className}>
			{data.map(btn => {
				const label = btn.label ?? btn.value;
				const selectedValue = value.includes(btn.value);

				return (
					<Button
						key={btn.value}
						disabled={isDisabled}
						onClick={() => {
							const i = value.indexOf(btn.value);
							if (i >= 0) onChange(value.remove(i));
							else {
								const uu = value.slice();
								uu.push(btn.value);
								onChange(uu);
							}
						}}
						color={selectedValue ? 'primary' : undefined}>
						{label}
					</Button>
				);
			})}
		</BtnGroup>
	);
}

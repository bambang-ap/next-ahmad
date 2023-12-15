import {useContext} from 'react';

import {ButtonGroup as BtnGroup} from '@mui/material';
import {FieldValues} from 'react-hook-form';

import {Button} from '@components';
import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';
import {classNames} from '@utils';

import {FormContext} from '../Form';
import {SelectProps} from './Select';

export const ButtonGroup = withReactFormController(SelectComponent);
export const MultipleButtonGroup = withReactFormController(SelectComponent2);

type HH = Pick<SelectProps, 'data' | 'disabled'> & {wrapped?: boolean};

function SelectComponent<F extends FieldValues>({
	data = [],
	disabled,
	controller,
	className,
	wrapped,
}: ControlledComponentProps<F, HH>) {
	const formContext = useContext(FormContext);

	const {
		field: {value, onChange},
	} = controller;

	const isDisabled = formContext?.disabled || disabled;

	return (
		<BtnGroup
			className={classNames({'flex-wrap': wrapped}, className)}
			variant={wrapped ? 'outlined' : 'contained'}>
			{data.map(btn => {
				const label = btn.label ?? btn.value;
				const selectedValue = btn.value === value;

				const btnn = (
					<Button
						className="flex-1"
						disabled={isDisabled}
						onClick={() => onChange(btn.value)}
						color={selectedValue ? 'primary' : undefined}>
						{label}
					</Button>
				);

				if (!wrapped) return btnn;

				return (
					<div
						key={btn.value}
						className={classNames({
							'flex w-1/3 !rounded-xl p-1': wrapped,
						})}>
						{btnn}
					</div>
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
	wrapped,
}: ControlledComponentProps<F, HH>) {
	const formContext = useContext(FormContext);

	const {
		field: {value: val = [], onChange},
	} = controller;
	const value = val as (string | number)[];
	const isDisabled = formContext?.disabled || disabled;

	return (
		<BtnGroup
			variant="contained"
			className={classNames({'flex-wrap': wrapped}, className)}>
			{data.map(btn => {
				const label = btn.label ?? btn.value;
				const selectedValue = value.includes(btn.value);
				const btnn = (
					<Button
						className="flex-1"
						key={btn.value}
						disabled={isDisabled}
						color={selectedValue ? 'primary' : undefined}
						onClick={() => {
							const i = value.indexOf(btn.value);
							if (i >= 0) onChange(value.remove(i));
							else {
								const uu = value.slice();
								uu.push(btn.value);
								onChange(uu);
							}
						}}>
						{label}
					</Button>
				);

				if (!wrapped) return btnn;

				return (
					<div
						key={btn.value}
						className={classNames({
							'flex w-1/3 !rounded-xl p-1': wrapped,
						})}>
						{btnn}
					</div>
				);
			})}
		</BtnGroup>
	);
}

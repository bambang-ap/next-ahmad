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
import {SelectProps, SelectPropsData} from './Select';

export const ButtonGroup = withReactFormController(GrpComp1);
export const MultipleButtonGroup = withReactFormController(GrpComp2);

type GroupBtnProps<T extends string | number = string> = GroupBtnSelect & {
	multiple?: boolean;
	className?: string;
	disabled?: boolean;
	value?: T | T[];
	onClear?: NoopVoid;
	onChange?: (btn: SelectPropsData<string | number>) => unknown;
};

type GroupBtnSelect = Pick<SelectProps, 'data' | 'disabled'> & {
	label?: string;
	wrapped?: boolean;
	vertical?: boolean;
	clearable?: boolean;
};

function GrpComp1<F extends FieldValues>(
	props: ControlledComponentProps<F, GroupBtnSelect>,
) {
	const {disabled, controller} = props;
	const {
		field: {value, onChange},
	} = controller;

	const formContext = useContext(FormContext);
	const isDisabled = formContext?.disabled || disabled;

	return (
		<GroupBtn
			{...props}
			value={value}
			disabled={isDisabled}
			onChange={btn => onChange(btn.value)}
			onClear={() => onChange(undefined)}
		/>
	);
}

function GrpComp2<F extends FieldValues>(
	props: ControlledComponentProps<F, GroupBtnSelect>,
) {
	const {disabled, controller} = props;

	const {
		field: {value: val = [], onChange},
	} = controller;

	const formContext = useContext(FormContext);
	const value = val as (string | number)[];
	const isDisabled = formContext?.disabled || disabled;

	return (
		<GroupBtn
			{...props}
			multiple
			value={value as string[]}
			disabled={isDisabled}
			onClear={() => onChange(undefined)}
			onChange={btn => {
				const i = value.indexOf(btn.value);
				if (i >= 0) onChange(value.remove(i));
				else {
					const uu = value.slice();
					uu.push(btn.value);
					onChange(uu);
				}
			}}
		/>
	);
}

function GroupBtn({
	data = [],
	label: btnLabel,
	className,
	multiple,
	clearable,
	wrapped,
	value,
	disabled,
	onClear = noop,
	onChange,
	vertical,
}: GroupBtnProps) {
	return (
		<>
			{!!btnLabel && <div>{btnLabel}</div>}
			<BtnGroup
				orientation={vertical ? 'vertical' : 'horizontal'}
				className={classNames({'flex-wrap': wrapped}, className)}
				variant={wrapped ? 'outlined' : 'contained'}>
				{data.map(btn => {
					const label = (btn.label ?? btn.value)?.toString()?.ucwords();
					const selectedValue = multiple
						? value?.includes(btn.value as string)
						: btn.value === value;

					const btnn = (
						<Button
							className="flex-1"
							disabled={disabled}
							onClick={() => onChange?.(btn)}
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
				{clearable && <Button onClick={onClear} icon="faClose" />}
			</BtnGroup>
		</>
	);
}

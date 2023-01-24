import React from 'react';

import {FieldValues} from 'react-hook-form';
import {
	ControlledComponentProps,
	withReactFormController,
} from 'src/hoc/withReactFormController';

type Props<F extends FieldValues> = ControlledComponentProps<F> & CheckBoxProps;

function CheckBoxComponent<F extends FieldValues>(props: Props<F>) {
	const {label, className, controller} = props;

	function onCheck() {
		controller?.field?.onChange(!controller?.field.value);
	}

	return (
		<>
			<input
				{...controller?.field}
				className={`${className}`}
				type="checkbox"
				checked={controller?.field.value}
				onClick={onCheck}
			/>
			<label>{label}</label>
		</>
	);
}

export type CheckBoxProps = {label: string; className?: string};
export const CheckBox = withReactFormController(CheckBoxComponent);

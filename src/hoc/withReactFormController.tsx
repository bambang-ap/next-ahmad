import React from 'react';

import {
	Control,
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
	UseControllerReturn,
} from 'react-hook-form';

export type ControlledComponentProps<F extends FieldValues> = {
	controller: UseControllerReturn<F>;
};

export const withReactFormController = <T extends {}, F extends FieldValues>(
	Component: (
		controlledComponentProps: Required<ControlledComponentProps<F>> & T,
	) => JSX.Element,
) => {
	type WrappedProps = Omit<ControllerProps<F>, 'name' | 'render'> & {
		control: Control<F>;
		fieldName: FieldPath<F>;
		className?: string;
	} & Omit<T, keyof ControlledComponentProps<F>>;
	return function Decorated({
		rules,
		control,
		fieldName,
		defaultValue,
		shouldUnregister,
		...props
	}: WrappedProps) {
		return (
			<Controller
				name={fieldName}
				rules={rules}
				shouldUnregister={shouldUnregister}
				control={control}
				defaultValue={defaultValue}
				render={controllerProps => (
					<Component
						controller={controllerProps}
						{...(props as unknown as T)}
					/>
				)}
			/>
		);
	};
};

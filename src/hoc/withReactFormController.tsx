import {
	Control,
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
	UseControllerReturn,
} from 'react-hook-form';

type DefaultProps = {
	leftAcc?: JSX.Element;
	rightAcc?: JSX.Element;
	className?: string;
};

export type ControlledComponentProps<
	F extends FieldValues,
	T extends {} = {},
> = T & {
	controller: UseControllerReturn<F>;
	defaultValue?: unknown;
} & Partial<DefaultProps>;

export const withReactFormController = <T extends {}, F extends FieldValues>(
	Component: (
		controlledComponentProps: Required<ControlledComponentProps<F>> & T,
	) => JSX.Element,
) => {
	type WrappedProps = Omit<ControllerProps<F>, 'name' | 'render'> & {
		control: Control<F>;
		fieldName: FieldPath<F>;
	} & Omit<T, keyof ControlledComponentProps<F>> &
		DefaultProps;
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
						defaultValue={defaultValue}
						controller={controllerProps}
						{...(props as unknown as T & Required<DefaultProps>)}
					/>
				)}
			/>
		);
	};
};

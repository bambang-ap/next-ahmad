import {useState} from "react";

import {
	Control,
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
	UseControllerProps,
	UseControllerReturn,
} from "react-hook-form";

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
	appliedRules?: (rules: UseControllerProps<F>["rules"]) => void;
} & Partial<DefaultProps>;

export type WrappedProps<F extends FieldValues, T extends {}> = Omit<
	ControllerProps<F>,
	"name" | "render"
> & {
	control: Control<F>;
	fieldName: FieldPath<F>;
} & Omit<T, keyof ControlledComponentProps<F>> &
	DefaultProps;

export const withReactFormController = <T extends {}, F extends FieldValues>(
	Component: (
		controlledComponentProps: Required<ControlledComponentProps<F>> & T,
	) => JSX.Element,
) => {
	return function Decorated({
		rules = {},
		control,
		fieldName,
		defaultValue,
		shouldUnregister,
		...props
	}: WrappedProps<F, T>) {
		const [rulesApply, setRulesApply] =
			useState<UseControllerProps<F>["rules"]>();

		return (
			<Controller
				name={fieldName}
				rules={{...rulesApply, ...rules}}
				shouldUnregister={shouldUnregister}
				control={control}
				defaultValue={defaultValue}
				render={controllerProps => (
					<Component
						appliedRules={setRulesApply}
						defaultValue={defaultValue}
						controller={controllerProps}
						{...(props as unknown as T & Required<DefaultProps>)}
					/>
				)}
			/>
		);
	};
};

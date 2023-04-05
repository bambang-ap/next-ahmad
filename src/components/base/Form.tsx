import {createContext, HtmlHTMLAttributes} from 'react';

export type TFormContext = {
	disabled?: boolean;
	hideButton?: boolean;
	disableSubmit?: boolean;
};
export type FormProps = HtmlHTMLAttributes<HTMLFormElement> & {
	context?: TFormContext;
};

export const FormContext = createContext<TFormContext | null>(null);

export function Form({children, onSubmit, context, ...rest}: FormProps) {
	return (
		<FormContext.Provider value={context ?? null}>
			<form {...rest} onSubmit={context?.disableSubmit ? undefined : onSubmit}>
				{children}
			</form>
		</FormContext.Provider>
	);
}

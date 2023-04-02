import {createContext, HtmlHTMLAttributes} from 'react';

export type TFormContext = {disabled?: boolean; hideButton?: boolean};
export type FormProps = HtmlHTMLAttributes<HTMLFormElement> & {
	context: TFormContext;
};

export const FormContext = createContext<TFormContext | null>(null);

export function Form({children, context, ...rest}: FormProps) {
	return (
		<FormContext.Provider value={context}>
			<form {...rest}>{children}</form>
		</FormContext.Provider>
	);
}

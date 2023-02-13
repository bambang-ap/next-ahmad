import {DOMAttributes, PropsWithChildren} from 'react';

export type TouchableProps = {
	className?: string;
	type?: 'submit' | 'button';
	onClick?: DOMAttributes<HTMLButtonElement>['onClick'];
};

export function Touchable(props: PropsWithChildren<TouchableProps>) {
	const {type = 'button', ...rest} = props;
	return <button type={type} {...rest} />;
}

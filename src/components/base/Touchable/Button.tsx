import {Button as ButtonFlowbite} from 'flowbite-react';

import {Icon, IconProps, TouchableProps} from '@components';
export type ButtonProps = TouchableProps & {
	variant?:
		| 'dark'
		| 'failure'
		| 'gray'
		| 'info'
		| 'light'
		| 'purple'
		| 'success'
		| 'warning';
	icon?: IconProps['name'];
	iconClassName?: string;
	children?: string;
	disabled?: boolean;
};

export function Button(props: ButtonProps) {
	const {
		className,
		iconClassName,
		children,
		icon,
		variant = 'light',
		...rest
	} = props;

	return (
		<ButtonFlowbite className={className} color={variant} {...rest}>
			{icon && <Icon className={iconClassName} name={icon} />}
			{children}
		</ButtonFlowbite>
	);
}

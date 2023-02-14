import {Button as ButtonFlowbite} from 'flowbite-react';

import {Icon, IconProps, TouchableProps} from '@components';
export type ButtonProps = TouchableProps & {
	variant?: 'primary' | 'secondary';
	icon?: IconProps['name'];
	iconClassName?: string;
	children?: string;
};

export function Button(props: ButtonProps) {
	const {
		className,
		iconClassName,
		children,
		icon,
		variant = 'primary',
		...rest
	} = props;

	return (
		<ButtonFlowbite className={className} color={variant} {...rest}>
			{icon && <Icon className={iconClassName} name={icon} />}
			{children}
		</ButtonFlowbite>
	);
}

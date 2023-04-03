import {ReactNode, useContext} from 'react';

import {
	Button as MUIButton,
	ButtonProps as MUIButtonProps,
} from '@mui/material';

import {FormContext, Icon, IconProps, TouchableProps} from '@components';
import {classNames} from '@utils';
export type ButtonProps = TouchableProps & {
	variant?: MUIButtonProps['color'];
	component?: string;
	icon?: IconProps['name'];
	iconClassName?: string;
	children?: ReactNode;
	disabled?: boolean;
};

export function Button(props: ButtonProps) {
	const formContext = useContext(FormContext);
	const {
		className,
		iconClassName,
		children,
		icon,
		variant = 'primary',
		...rest
	} = props;

	if (formContext?.hideButton) return null;
	return (
		<MUIButton
			color={variant}
			// variant="contained"
			// NOTE: Sementara
			sx={{textTransform: 'none'}}
			className={classNames('min-h-[36px]', className)}
			{...rest}>
			{icon && <Icon className={iconClassName} name={icon} />}
			{children}
		</MUIButton>
	);
}

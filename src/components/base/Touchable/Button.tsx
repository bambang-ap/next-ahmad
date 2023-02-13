import {Icon, IconProps, Touchable, TouchableProps} from '@components';

export type ButtonProps = TouchableProps & {
	variant?: 'primary' | 'secondary';
	icon?: IconProps['name'];
	children?: string;
};

export function Button(props: ButtonProps) {
	const {className, children, variant = 'primary', icon, ...rest} = props;

	const variantClassName = {
		get class() {
			if (variant === 'primary') return 'bg-app-primary-03 text-white';
			return 'bg-app-secondary-03 text-app-neutral-09';
		},
	};

	return (
		<Touchable
			className={`items-center rounded p-2 flex ${className} ${variantClassName.class}`}
			{...rest}>
			{icon && <Icon className="mr-2" name={icon} />}
			{children}
		</Touchable>
	);
}

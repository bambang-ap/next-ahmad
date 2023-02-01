import * as svgIcon from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {FieldValues} from 'react-hook-form';

import {ControlledComponentProps, withReactFormController} from '@hoc';

type IconName = Exclude<keyof typeof svgIcon, 'prefix' | 'fas'>;

export type IconProps = {
	name: LiteralUnion<IconName>;
	className?: string;
	onClick?: NoopVoid;
};

type IconFormComponentProps<F extends FieldValues> =
	ControlledComponentProps<F> & Omit<IconProps, 'name'>;

const IconFormComponent = <F extends FieldValues>(
	props: IconFormComponentProps<F>,
) => {
	const {controller, ...rest} = props;

	return <Icon name={controller?.field.value as IconName} {...rest} />;
};

export const IconForm = IconFormComponent;

export function Icon({name, onClick, className}: IconProps) {
	return (
		<FontAwesomeIcon
			onClick={onClick}
			className={className}
			icon={svgIcon[name as IconName]}
		/>
	);
}

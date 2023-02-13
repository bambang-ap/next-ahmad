import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';
import * as svgIcon from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {FieldValues} from 'react-hook-form';

type IconName = Exclude<keyof typeof svgIcon, 'prefix' | 'fas'>;

export type IconProps = {
	name: LiteralUnion<IconName>;
	className?: string;
	onClick?: NoopVoid;
};

export const IconForm = withReactFormController(IconFormComponent);

export function Icon({name, onClick, className}: IconProps) {
	if (!name) return null;

	return (
		<FontAwesomeIcon
			onClick={onClick}
			className={className}
			icon={svgIcon[name as IconName]}
		/>
	);
}

function IconFormComponent<F extends FieldValues>(
	props: ControlledComponentProps<F, Omit<IconProps, 'name'>>,
) {
	const {controller, ...rest} = props;

	return <Icon name={controller?.field.value as IconName} {...rest} />;
}

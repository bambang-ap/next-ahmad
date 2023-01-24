import * as svgIcon from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

type IconName = Exclude<keyof typeof svgIcon, 'prefix' | 'fas'>;

export type IconProps = {
	name: LiteralUnion<IconName>;
	className?: string;
	onClick?: NoopVoid;
};

export function Icon({name, onClick, className}: IconProps) {
	return (
		<FontAwesomeIcon
			onClick={onClick}
			className={className}
			icon={svgIcon[name as IconName]}
		/>
	);
}

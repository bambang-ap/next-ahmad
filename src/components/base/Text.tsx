import {classNames} from '@utils';

type TextProps = {
	children?: string;
	className?: string;
};

export function Text({children, className}: TextProps) {
	return (
		<label
			className={classNames('text-app-neutral-10 dark:text-white', className)}>
			{children}
		</label>
	);
}

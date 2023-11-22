import {Text} from '@components';
import {gap} from '@constants';
import {classNames} from '@utils';

export type WrapperProps = {
	noPadding?: boolean;
	noColon?: boolean;
	transparent?: boolean;
	sizes?: [title?: string, description?: string];
	className?: string;
	smallPadding?: boolean;
	children?: JSX.Element[] | JSX.Element | string;
} & Partial<Record<'title' | 'gap', string | null>>;

export function Wrapper({
	gap: gapSpacing = gap,
	title,
	children,
	sizes,
	className,
	noColon,
	transparent,
	noPadding,
	smallPadding,
}: WrapperProps) {
	const [sizeTitle, sizeDesc] = sizes ?? ['w-1/4', 'flex-1'];

	const conditionalClassName = classNames({
		'bg-white': !transparent,
		['p-2 px-4']: !noPadding && !smallPadding,
		['p-1 px-2']: !noPadding && smallPadding,
	});

	return (
		<div className={classNames('flex', gapSpacing)}>
			<Text
				color="black"
				className={classNames(sizeTitle, className, conditionalClassName)}>
				{title}
			</Text>
			{!noColon && (
				<Text className={classNames(className, conditionalClassName)}>:</Text>
			)}
			<Text
				color="black"
				className={classNames(sizeDesc, className, conditionalClassName)}>
				{children}
			</Text>
		</div>
	);
}

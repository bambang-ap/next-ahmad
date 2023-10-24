import {Text} from '@components';
import {gap} from '@constants';
import {classNames} from '@utils';

export type WrapperProps = {
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
	smallPadding,
}: WrapperProps) {
	const [sizeTitle, sizeDesc] = sizes ?? ['w-1/4', 'flex-1'];

	return (
		<div className={classNames('flex', gapSpacing)}>
			<Text
				color="black"
				className={classNames(sizeTitle, className, {
					'bg-white': !transparent,
					['p-2 px-4']: !smallPadding,
					['p-1 px-2']: smallPadding,
				})}>
				{title}
			</Text>
			{!noColon && (
				<Text
					className={classNames(className, {
						'bg-white': !transparent,
						['p-2 px-4']: !smallPadding,
						['p-1 px-2']: smallPadding,
					})}>
					:
				</Text>
			)}
			<Text
				color="black"
				className={classNames(sizeDesc, className, {
					'bg-white': !transparent,
					['p-2 px-4']: !smallPadding,
					['p-1 px-2']: smallPadding,
				})}>
				{children}
			</Text>
		</div>
	);
}

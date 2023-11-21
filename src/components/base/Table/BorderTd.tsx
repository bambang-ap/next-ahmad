import {TdHTMLAttributes} from 'react';

import {classNames} from '@utils';

export type BorderTdProps = TdHTMLAttributes<HTMLTableCellElement> & {
	top?: boolean;
	col?: boolean;
	center?: boolean;
	rootClassName?: string;
};

export function BorderTd({
	children,
	center,
	top,
	className,
	col = false,
	rootClassName,
	...props
}: BorderTdProps) {
	return (
		<td
			{...props}
			className={classNames(
				'border-black border',
				'flex-1 px-2 py-1',
				'font-semibold',
				'pb-2',
				rootClassName,
			)}>
			<div
				className={classNames(
					'flex',
					{['justify-center']: center, ['items-start']: top, 'flex-col': col},
					className,
				)}>
				{children}
			</div>
		</td>
	);
}

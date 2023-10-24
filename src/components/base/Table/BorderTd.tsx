import {TdHTMLAttributes} from 'react';

import {classNames} from '@utils';

export type BorderTdProps = TdHTMLAttributes<HTMLTableCellElement> & {
	top?: boolean;
	center?: boolean;
	row?: boolean;
	rootClassName?: string;
};

export function BorderTd({
	children,
	center,
	top,
	className,
	row = false,
	rootClassName,
	...props
}: BorderTdProps) {
	return (
		<td
			{...props}
			className={classNames(
				'border-black border-2',
				'flex-1 px-2 py-1',
				'font-semibold',
				'pb-2',
				rootClassName,
			)}>
			<div
				className={classNames(
					'flex',
					{['justify-center']: center, ['items-start']: top, 'flex-col': row},
					className,
				)}>
				{children}
			</div>
		</td>
	);
}

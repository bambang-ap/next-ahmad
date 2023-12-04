import {ReactNode} from 'react';

import {Masonry} from '@mui/lab';

import {classNames} from '@utils';

type GalleryProps<T> = {
	data: T[];
	renderItem: (
		value: MMapValue<T> & {
			Col: (props: {className?: string; children: ReactNode}) => JSX.Element;
		},
		index: number,
	) => JSX.Element;
	columns: number;
	spacing?: number;
};

export function Gallery<T>({
	data,
	columns,
	renderItem,
	spacing = 1,
}: GalleryProps<T>) {
	return (
		<Masonry columns={columns} spacing={spacing}>
			{data.mmap((item, index) =>
				renderItem(
					{
						...item,
						Col: ({className, ...props}) => (
							<div
								className={classNames('flex flex-col', className)}
								{...props}
							/>
						),
					},
					index,
				),
			)}
		</Masonry>
	);
}

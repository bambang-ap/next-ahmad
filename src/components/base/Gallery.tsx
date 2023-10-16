import {Masonry} from '@mui/lab';

import {classNames} from '@utils';

type GalleryProps<T> = {
	data: T[];
	renderItem: MMapCallback<T, JSX.Element>;
	columns: number;
	spacing?: number;
	className?: string;
};

export function Gallery<T>({
	data,
	columns,
	renderItem,
	spacing = 1,
	className,
}: GalleryProps<T>) {
	return (
		<Masonry columns={columns} spacing={spacing}>
			{data.mmap((item, index) => (
				<div className={classNames('flex flex-col rounded border', className)}>
					{renderItem(item, index)}
				</div>
			))}
		</Masonry>
	);
}

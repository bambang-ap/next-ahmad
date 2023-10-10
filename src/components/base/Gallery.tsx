import {Masonry} from '@mui/lab';

type GalleryProps<T> = {
	data: T[];
	renderItem: MMapCallback<T, JSX.Element>;
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
			{data.mmap((item, index) => (
				<div className="flex flex-col items-center rounded border">
					{renderItem(item, index)}
				</div>
			))}
		</Masonry>
	);
}

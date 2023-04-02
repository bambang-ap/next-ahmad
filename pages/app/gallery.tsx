import Masonry from '@mui/lab/Masonry';
import {Divider} from '@mui/material';

import {ImageWithPreview, Text} from '@components';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

GalleryKanban.getLayout = getLayout;

export default function GalleryKanban() {
	const {data} = trpc.kanban.images.useQuery();

	if (!data) return null;

	return (
		<Masonry columns={8} spacing={1}>
			{data.map(({keterangan, image}, index) => (
				<div key={index} className="flex flex-col items-center rounded border">
					<div className="p-2">
						<Text>{keterangan}</Text>
					</div>
					<Divider className="w-full" />
					<div className="p-2">
						<ImageWithPreview src={image!} />
					</div>
				</div>
			))}
		</Masonry>
	);
}

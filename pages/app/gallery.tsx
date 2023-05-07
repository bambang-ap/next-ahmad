import {Divider} from "@mui/material";

import {Gallery, ImageWithPreview, Text} from "@components";
import {getLayout} from "@hoc";
import {trpc} from "@utils/trpc";

GalleryKanban.getLayout = getLayout;

export default function GalleryKanban() {
	const {data} = trpc.kanban.images.useQuery();

	if (!data) return null;

	return (
		<Gallery
			data={data}
			columns={8}
			renderItem={({item: {keterangan, image}}) => {
				return (
					<>
						<div className="p-2">
							<Text>{keterangan}</Text>
						</div>
						<Divider className="w-full" />
						<div className="p-2">
							<ImageWithPreview src={image!} />
						</div>
					</>
				);
			}}
		/>
	);
}

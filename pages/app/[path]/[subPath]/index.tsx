import {PageTable} from "@appComponent/PageTable";
import {getLayout} from "@hoc";

export default function PageSubPath() {
	return <PageTable />;
}

PageSubPath.getLayout = getLayout;

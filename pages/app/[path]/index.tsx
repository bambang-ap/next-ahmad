import {PageTable} from '@appComponent/PageTable';
import {getLayout} from '@hoc';

export default function PagePath() {
	return <PageTable />;
}

PagePath.getLayout = getLayout;

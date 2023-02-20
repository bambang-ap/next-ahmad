import {PageTable} from '@appComponent/PageTable';
import {ModalType, TMesin} from '@appTypes/app.type';
import {getLayout} from '@hoc';

type MesinForm = TMesin & {
	type: ModalType;
};

export default function PagePath() {
	return <PageTable />;
}

PagePath.getLayout = getLayout;

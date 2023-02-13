import {useRef} from 'react';

import {useRouter} from 'next/router';
import {Control, useForm, useWatch} from 'react-hook-form';

import {PageTable} from '@appComponent/PageTable';
import {ModalType, TMesin} from '@appTypes/app.type';
import {Input, Modal, ModalRef, Table} from '@components';
import {getLayout} from '@hoc';
import {useFetchMesin, useManageMesin} from '@queries';

type MesinForm = TMesin & {
	type: ModalType;
};

export default function PagePath() {
	return <PageTable />;
}

PagePath.getLayout = getLayout;

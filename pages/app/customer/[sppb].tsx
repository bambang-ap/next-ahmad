import {useRouter} from 'next/router';

import {getLayout} from '@hoc';

export default function SPPB() {
	const d = useRouter();
	console.log(d);
	return null;
}

SPPB.getLayout = getLayout;

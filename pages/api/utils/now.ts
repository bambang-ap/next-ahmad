import {NextApiHandler} from 'next';

import {getNow, Response} from '@server';

const now: NextApiHandler = (_, res) => {
	const today = getNow();

	return Response(res).success({today});
};

export default now;

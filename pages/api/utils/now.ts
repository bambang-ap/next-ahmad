import moment from 'moment';
import {NextApiHandler} from 'next';

import {Response} from '@server';

const now: NextApiHandler = (req, res) => {
	const today = moment().toLocaleString();

	return Response(res).success({today});
};

export default now;

import {OrmUser} from '@database';
import {NextApiRequest, NextApiResponse} from 'next';

import {Response} from '@server';

export default async function apiMenu(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const d = await OrmUser.create({
		id: uuid(),
		email: 'Jane',
		name: 'Doe',
		password: 'e56tyghbjsdnfkjlyig',
	});

	return Response(res).success(d);
}

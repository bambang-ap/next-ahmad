import {OrmRole} from '@database';
import {NextApiRequest, NextApiResponse} from 'next';

import {getSession, Response} from '@server';

export default async function apiUser(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	const users = await OrmRole.findAll({raw: true});

	return Response(res).success(users);
}

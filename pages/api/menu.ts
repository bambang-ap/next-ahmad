import {NextApiRequest, NextApiResponse} from 'next';
import {Op} from 'sequelize';

import {TMenu} from '@appTypes/app.type';
import {OrmMenu} from '@database';
import {getSession, Response} from '@server';

export default async function apiMenu(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession, session} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	const allMenu = await OrmMenu.findAll({
		where: {accepted_role: {[Op.substring]: session?.user?.role}},
		order: [['index', 'asc']],
		raw: true,
	});

	return Response(res).success(allMenu);
}

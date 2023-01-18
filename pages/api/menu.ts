import {OrmMenu} from '@database';
import {NextApiRequest, NextApiResponse} from 'next';
import {Op} from 'sequelize';

import {TMenu} from '@appTypes/app.type';
import {getSession, Response} from '@server';

export default async function apiMenu(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession, session} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	const menu = await OrmMenu.findAll({
		where: {accepted_role: {[Op.substring]: session?.user?.role}},
		order: [['index', 'asc']],
		raw: true,
	});

	const allMenu = (menu as unknown as TMenu[]).nest(
		'subMenu',
		'id',
		'parent_id',
	);

	return Response(res).success(allMenu);
}

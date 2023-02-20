import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';
import {Op} from 'sequelize';

import {TMenu} from '@appTypes/app.type';
import {OrmMenu} from '@database';
import {getSession, Response} from '@server';

const apiMenu: NextApiHandler<string> = async (req, res) => {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getMenu(req, res);
		case 'PUT':
			return updateMenu(req, res);
		default:
			return Response(res).error('Method not allowed');
	}
};

export default apiMenu;

async function getMenu(req: NextApiRequest, res: NextApiResponse) {
	const {session} = await getSession(req, res);

	const allMenu = await OrmMenu.findAll({
		where: {accepted_role: {[Op.substring]: session?.user?.role}},
		order: [
			['index', 'asc'],
			['title', 'asc'],
		],
	});

	return Response(res).success(allMenu);
}

async function updateMenu(req: NextApiRequest, res: NextApiResponse) {
	const body = req.body as TMenu[];

	const promises = body.map(async ({id, ...row}) => {
		return OrmMenu.update(row, {where: {id}});
	});

	const updatedMenu = await Promise.all(promises);

	return Response(res).success(updatedMenu);
}

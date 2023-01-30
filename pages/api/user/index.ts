import {NextApiRequest, NextApiResponse} from 'next';

import {TUser} from '@appTypes/app.type';
import {OrmUser} from '@database';
import {getSession, Response} from '@server';

export default async function apiUser(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getUser(res);
		case 'POST':
			return insertUser(req, res);
		case 'PUT':
			return updateUser(req, res);
		case 'DELETE':
			return deleteUser(req, res);
		default:
			return Response(res).error('Method not allowed');
	}
}

async function getUser(res: NextApiResponse) {
	const roles = await OrmUser.findAll({
		order: [['id', 'asc']],
		raw: true,
	});

	return Response(res).success(roles);
}

async function insertUser(req: NextApiRequest, res: NextApiResponse) {
	const body = req.body as TUser;
	const createdRole = await OrmUser.create(body);

	return Response(res).success(createdRole);
}

async function updateUser(req: NextApiRequest, res: NextApiResponse) {
	const {id, ...user} = req.body as TUser;
	const updatedRole = await OrmUser.update(user, {where: {id}});

	return Response(res).success(updatedRole);
}

async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
	const {id} = req.body as Pick<TUser, 'id'>;
	const createdRole = await OrmUser.destroy({where: {id}});

	return Response(res).success({success: createdRole});
}

import {NextApiRequest, NextApiResponse} from 'next';

import {OrmRole} from '@database';
import {getSession, Response} from '@server';

export default async function apiUser(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getRole(res);
		case 'POST':
			return insertRole(req, res);
		case 'PUT':
			return updateRole(req, res);
		case 'DELETE':
			return deleteRole(req, res);
		default:
			return Response(res).error('Method not allowed');
	}
}

async function getRole(res: NextApiResponse) {
	const roles = await OrmRole.findAll({raw: true});

	return Response(res).success(roles);
}

async function insertRole(req: NextApiRequest, res: NextApiResponse) {
	const createdRole = await OrmRole.create({name: req.body.name});

	return Response(res).success(createdRole);
}

async function updateRole(req: NextApiRequest, res: NextApiResponse) {
	const updatedRole = await OrmRole.update(
		{name: req.body.name},
		{where: {id: req.body.id}},
	);
	return Response(res).success(updatedRole);
}

async function deleteRole(req: NextApiRequest, res: NextApiResponse) {
	const createdRole = await OrmRole.destroy({where: {id: req.body.id}});
	return Response(res).success({success: createdRole});
}

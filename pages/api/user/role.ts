import {NextApiRequest, NextApiResponse} from 'next';

import {TRole} from '@appTypes/app.type';
import {OrmRole} from '@database';
import {getSession, Response} from '@server';

export default async function apiRole(
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
	const roles = await OrmRole.findAll({order: [['id', 'asc']], raw: true});

	return Response(res).success(roles);
}

async function insertRole(req: NextApiRequest, res: NextApiResponse) {
	const {name} = req.body as TRole;
	const createdRole = await OrmRole.create({name});

	return Response(res).success(createdRole);
}

async function updateRole(req: NextApiRequest, res: NextApiResponse) {
	const {id, name} = req.body as TRole;
	const updatedRole = await OrmRole.update({name}, {where: {id}});

	return Response(res).success(updatedRole);
}

async function deleteRole(req: NextApiRequest, res: NextApiResponse) {
	const {id} = req.body as Pick<TRole, 'id'>;
	const createdRole = await OrmRole.destroy({where: {id}});

	return Response(res).success({success: createdRole});
}

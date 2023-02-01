import {NextApiRequest, NextApiResponse} from 'next';

import {TMesin} from '@appTypes/app.type';
import {OrmMesin} from '@database';
import {generateId, getSession, Response} from '@server';

export default async function apiMesin(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getMesin(res);
		case 'POST':
			return insertMesin(req, res);
		case 'PUT':
			return updateMesin(req, res);
		case 'DELETE':
			return deleteMesin(req, res);
		default:
			return Response(res).error('Method not allowed');
	}
}

async function getMesin(res: NextApiResponse) {
	const mesins = await OrmMesin.findAll({order: [['id', 'asc']], raw: true});

	return Response(res).success(mesins);
}

async function insertMesin(req: NextApiRequest, res: NextApiResponse) {
	const body = req.body as TMesin;
	const createdMesin = await OrmMesin.create({...body, id: generateId()});

	return Response(res).success(createdMesin);
}

async function updateMesin(req: NextApiRequest, res: NextApiResponse) {
	const {id, ...body} = req.body as TMesin;
	const updatedMesin = await OrmMesin.update(body, {where: {id}});

	return Response(res).success(updatedMesin);
}

async function deleteMesin(req: NextApiRequest, res: NextApiResponse) {
	const {id} = req.body as Pick<TMesin, 'id'>;
	const createdMesin = await OrmMesin.destroy({where: {id}});

	return Response(res).success({success: createdMesin});
}

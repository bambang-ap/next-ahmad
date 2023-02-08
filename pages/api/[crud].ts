import {NextApiRequest, NextApiResponse} from 'next';

import {generateId, getSession, MAPPING_CRUD_ORM, Response} from '@server';

type TOrm = typeof MAPPING_CRUD_ORM;
type TOrms = TOrm[keyof TOrm];

export default async function apiCrud(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const orm = MAPPING_CRUD_ORM[req.query.crud as keyof typeof MAPPING_CRUD_ORM];

	if (!orm) return Response(res).error('The page you access not found');

	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getCrud(res, orm);
		case 'POST':
			return insertCrud(req, res, orm);
		case 'PUT':
			return updateCrud(req, res, orm);
		case 'DELETE':
			return deleteCrud(req, res, orm);
		default:
			return Response(res).error('Method not allowed');
	}
}

async function getCrud(res: NextApiResponse, orm: TOrms) {
	const mesins = await orm.findAll({order: [['id', 'asc']], raw: true});

	return Response(res).success(mesins);
}

async function insertCrud(
	req: NextApiRequest,
	res: NextApiResponse,
	orm: TOrms,
) {
	const body = req.body;
	const createdMesin = await orm.create({...body, id: generateId()});

	return Response(res).success(createdMesin);
}

async function updateCrud(
	req: NextApiRequest,
	res: NextApiResponse,
	orm: TOrms,
) {
	const {id, ...body} = req.body;
	const updatedMesin = await orm.update(body, {where: {id}});

	return Response(res).success(updatedMesin);
}

async function deleteCrud(
	req: NextApiRequest,
	res: NextApiResponse,
	orm: TOrms,
) {
	const {id} = req.body;
	const createdMesin = await orm.destroy({where: {id}});

	return Response(res).success({success: createdMesin});
}

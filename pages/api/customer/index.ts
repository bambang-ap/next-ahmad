import {NextApiRequest, NextApiResponse} from 'next';

import {TCustomer} from '@appTypes/app.type';
import {OrmCustomer} from '@database';
import {generateId, getSession, Response} from '@server';

export default async function apiCustomer(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getCustomer(res);
		case 'POST':
			return insertCustomer(req, res);
		case 'PUT':
			return updateCustomer(req, res);
		case 'DELETE':
			return deleteCustomer(req, res);
		default:
			return Response(res).error('Method not allowed');
	}
}

async function getCustomer(res: NextApiResponse) {
	const roles = await OrmCustomer.findAll({order: [['id', 'asc']], raw: true});

	return Response(res).success(roles);
}

async function insertCustomer(req: NextApiRequest, res: NextApiResponse) {
	const body = req.body as TCustomer;
	const createdCustomer = await OrmCustomer.create({...body, id: generateId()});

	return Response(res).success(createdCustomer);
}

async function updateCustomer(req: NextApiRequest, res: NextApiResponse) {
	const {id, ...rest} = req.body as TCustomer;
	const updatedCustomer = await OrmCustomer.update(rest, {where: {id}});

	return Response(res).success(updatedCustomer);
}

async function deleteCustomer(req: NextApiRequest, res: NextApiResponse) {
	const {id} = req.body as Pick<TCustomer, 'id'>;
	const createdCustomer = await OrmCustomer.destroy({where: {id}});

	return Response(res).success({success: createdCustomer});
}

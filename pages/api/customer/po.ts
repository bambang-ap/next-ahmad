import {NextApiRequest, NextApiResponse} from 'next';

import {TCustomerPO} from '@appTypes/app.type';
import {OrmCustomerPO} from '@database';
import {generateId, getSession, Response} from '@server';

export default async function apiCustomerPO(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getCustomerPO(res);
		case 'POST':
			return insertCustomerPO(req, res);
		case 'PUT':
			return updateCustomerPO(req, res);
		case 'DELETE':
			return deleteCustomerPO(req, res);
		default:
			return Response(res).error('Method not allowed');
	}
}

async function getCustomerPO(res: NextApiResponse) {
	const roles = await OrmCustomerPO.findAll({
		order: [['id', 'asc']],
		raw: true,
	});

	return Response(res).success(roles);
}

async function insertCustomerPO(req: NextApiRequest, res: NextApiResponse) {
	const body = req.body as TCustomerPO;
	const createdCustomerPO = await OrmCustomerPO.create({
		...body,
		id: generateId(),
	});

	return Response(res).success(createdCustomerPO);
}

async function updateCustomerPO(req: NextApiRequest, res: NextApiResponse) {
	const {id, ...rest} = req.body as TCustomerPO;
	const updatedCustomerPO = await OrmCustomerPO.update(rest, {where: {id}});

	return Response(res).success(updatedCustomerPO);
}

async function deleteCustomerPO(req: NextApiRequest, res: NextApiResponse) {
	const {id} = req.body as Pick<TCustomerPO, 'id'>;
	const createdCustomerPO = await OrmCustomerPO.destroy({where: {id}});

	return Response(res).success({success: createdCustomerPO});
}

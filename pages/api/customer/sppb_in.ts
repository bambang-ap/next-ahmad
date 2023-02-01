import {NextApiRequest, NextApiResponse} from 'next';

import {TCustomerSPPBIn} from '@appTypes/app.type';
import {OrmCustomerSPPBIn} from '@database';
import {generateId, getSession, Response} from '@server';

export default async function apiCustomerSPPBIn(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getCustomerSPPBIn(res);
		case 'POST':
			return insertCustomerSPPBIn(req, res);
		case 'PUT':
			return updateCustomerSPPBIn(req, res);
		case 'DELETE':
			return deleteCustomerSPPBIn(req, res);
		default:
			return Response(res).error('Method not allowed');
	}
}

async function getCustomerSPPBIn(res: NextApiResponse) {
	const roles = await OrmCustomerSPPBIn.findAll({
		order: [['id', 'asc']],
		raw: true,
	});

	return Response(res).success(roles);
}

async function insertCustomerSPPBIn(req: NextApiRequest, res: NextApiResponse) {
	const body = req.body as TCustomerSPPBIn;
	const createdCustomerSPPBIn = await OrmCustomerSPPBIn.create({
		...body,
		id: generateId(),
	});

	return Response(res).success(createdCustomerSPPBIn);
}

async function updateCustomerSPPBIn(req: NextApiRequest, res: NextApiResponse) {
	const {id, ...rest} = req.body as TCustomerSPPBIn;
	const updatedCustomerSPPBIn = await OrmCustomerSPPBIn.update(rest, {
		where: {id},
	});

	return Response(res).success(updatedCustomerSPPBIn);
}

async function deleteCustomerSPPBIn(req: NextApiRequest, res: NextApiResponse) {
	const {id} = req.body as Pick<TCustomerSPPBIn, 'id'>;
	const createdCustomerSPPBIn = await OrmCustomerSPPBIn.destroy({where: {id}});

	return Response(res).success({success: createdCustomerSPPBIn});
}

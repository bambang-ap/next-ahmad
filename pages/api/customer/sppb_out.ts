import {NextApiRequest, NextApiResponse} from 'next';

import {TCustomerSPPBOut} from '@appTypes/app.type';
import {OrmCustomerSPPBOut} from '@database';
import {generateId, getSession, Response} from '@server';

export default async function apiCustomerSPPBOut(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	switch (req.method) {
		case 'GET':
			return getCustomerSPPBOut(res);
		case 'POST':
			return insertCustomerSPPBOut(req, res);
		case 'PUT':
			return updateCustomerSPPBOut(req, res);
		case 'DELETE':
			return deleteCustomerSPPBOut(req, res);
		default:
			return Response(res).error('Method not allowed');
	}
}

async function getCustomerSPPBOut(res: NextApiResponse) {
	const roles = await OrmCustomerSPPBOut.findAll({
		order: [['id', 'asc']],
		raw: true,
	});

	return Response(res).success(roles);
}

async function insertCustomerSPPBOut(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const body = req.body as TCustomerSPPBOut;
	const createdCustomerSPPBOut = await OrmCustomerSPPBOut.create({
		...body,
		id: generateId(),
	});

	return Response(res).success(createdCustomerSPPBOut);
}

async function updateCustomerSPPBOut(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {id, ...rest} = req.body as TCustomerSPPBOut;
	const updatedCustomerSPPBOut = await OrmCustomerSPPBOut.update(rest, {
		where: {id},
	});

	return Response(res).success(updatedCustomerSPPBOut);
}

async function deleteCustomerSPPBOut(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {id} = req.body as Pick<TCustomerSPPBOut, 'id'>;
	const createdCustomerSPPBOut = await OrmCustomerSPPBOut.destroy({
		where: {id},
	});

	return Response(res).success({success: createdCustomerSPPBOut});
}

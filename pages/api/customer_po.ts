import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';

import {OrmCustomerPO} from '@database';
import {checkCredential, Response} from '@server';

const apiCustomerPO: NextApiHandler = async (req, res) => {
	return checkCredential(req, res, () => {
		switch (req.method) {
			case 'GET':
				return getCustomerPO(req, res);
			case 'PUT':
				return updateCustomerPO(req, res);
			default:
				return Response(res).error('Method not allowed');
		}
	});
};

export default apiCustomerPO;

async function getCustomerPO(req: NextApiRequest, res: NextApiResponse) {
	const allMenu = await OrmCustomerPO.findAll({raw: true});

	return Response(res).success(allMenu);
}

async function updateCustomerPO(req: NextApiRequest, res: NextApiResponse) {
	return Response(res).error('Method not allowed');
}

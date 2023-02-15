import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';

import {OrmCustomerPO, OrmCustomerPOItem} from '@database';
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

async function getCustomerPO(_: NextApiRequest, res: NextApiResponse) {
	const allPO = await OrmCustomerPO.findAll({raw: true});
	const joinedPOPromises = allPO.map(async ({nomor_po, ...rest}) => {
		const po_item = await OrmCustomerPOItem.findAll({where: {nomor_po}});
		return {nomor_po, ...rest, po_item};
	});
	const joinedPO = await Promise.all(joinedPOPromises);
	return Response(res).success(joinedPO);
}

async function updateCustomerPO(_: NextApiRequest, res: NextApiResponse) {
	return Response(res).error('Method not allowed');
}

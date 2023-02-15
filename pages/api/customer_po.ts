import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';

import {TCustomerPO} from '@appTypes/app.type';
import {OrmCustomer, OrmCustomerPO, OrmCustomerPOItem} from '@database';
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
	const joinedPOPromises = allPO.map(
		async ({nomor_po, id_customer, ...rest}: TCustomerPO) => {
			const po_item = await OrmCustomerPOItem.findAll({where: {nomor_po}});
			const customer = await OrmCustomer.findOne({
				where: {id: id_customer},
			});
			return {nomor_po, id_customer, customer, po_item, ...rest};
		},
	);
	const joinedPO = await Promise.all(joinedPOPromises);
	return Response(res).success(joinedPO);
}

async function updateCustomerPO(_: NextApiRequest, res: NextApiResponse) {
	return Response(res).error('Method not allowed');
}

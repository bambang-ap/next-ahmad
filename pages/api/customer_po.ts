import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';

import {TCustomerPO} from '@appTypes/app.type';
import {OrmCustomer, OrmCustomerPO, OrmCustomerPOItem} from '@database';
import {checkCredential, generateId, Response} from '@server';

const apiCustomerPO: NextApiHandler = async (req, res) => {
	return checkCredential(req, res, () => {
		switch (req.method) {
			case 'GET':
				return getCustomerPO(req, res);
			case 'POST':
				return insertCustomerPO(req, res);
			case 'PUT':
				return updateCustomerPO(req, res);
			case 'DELETE':
				return deleteCustomerPO(req, res);
			default:
				return Response(res).error('Method not allowed');
		}
	});
};

export default apiCustomerPO;

async function getCustomerPO(_: NextApiRequest, res: NextApiResponse) {
	const allPO = await OrmCustomerPO.findAll();
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

async function insertCustomerPO(req: NextApiRequest, res: NextApiResponse) {
	const {po_item, nomor_po, ...body} = req.body as TCustomerPO;
	await OrmCustomerPO.create({...body, id: generateId(), nomor_po});
	const poItemPromises = po_item?.map(item =>
		OrmCustomerPOItem.create({...item, id: generateId(), nomor_po}),
	);
	await Promise.all(poItemPromises);
	return Response(res).success({message: 'Success'});
}

async function updateCustomerPO(req: NextApiRequest, res: NextApiResponse) {
	const {id, po_item, nomor_po, ...body} = req.body as TCustomerPO;
	await OrmCustomerPO.update(
		{...body, id: generateId(), nomor_po},
		{where: {id}},
	);
	const poItemPromises = po_item?.map(item =>
		OrmCustomerPOItem.upsert({...item, id: item.id || generateId(), nomor_po}),
	);
	await Promise.all(poItemPromises);
	return Response(res).success({message: 'Success'});
}

async function deleteCustomerPO(req: NextApiRequest, res: NextApiResponse) {
	const {nomor_po} = req.body as TCustomerPO;
	await OrmCustomerPOItem.destroy({where: {nomor_po}});
	await OrmCustomerPO.destroy({where: {nomor_po}});
	return Response(res).success({message: 'Success'});
}

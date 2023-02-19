import {z} from 'zod';

import {TCustomerPO} from '@appTypes/app.type';
import {tCustomerPO} from '@appTypes/app.zod';
import {OrmCustomer, OrmCustomerPO, OrmCustomerPOItem} from '@database';
import {checkCredentialV2, generateId} from '@server';
import {procedure} from '@trpc';

const customer_poRouters = {
	customer_po_get: procedure
		.input(
			z.object({
				type: z.string(),
			}),
		)
		.query(async ({ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const allPO = (await OrmCustomerPO.findAll({
					raw: true,
				})) as TCustomerPO[];
				const joinedPOPromises = allPO.map(
					async ({nomor_po, id_customer, ...rest}) => {
						const po_item = await OrmCustomerPOItem.findAll({
							where: {nomor_po},
						});
						const customer = await OrmCustomer.findOne({
							where: {id: id_customer},
						});
						return {nomor_po, id_customer, customer, po_item, ...rest};
					},
				);

				const joinedPO = await Promise.all(joinedPOPromises);

				return joinedPO;
			});
		}),

	customer_po_insert: procedure
		.input(tCustomerPO)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {po_item, nomor_po, ...body} = input;
				await OrmCustomerPO.create({...body, id: generateId(), nomor_po});
				const poItemPromises = po_item?.map(item =>
					OrmCustomerPOItem.create({...item, id: generateId(), nomor_po}),
				);
				await Promise.all(poItemPromises);
				return {message: 'Success'};
			});
		}),

	customer_po_update: procedure
		.input(tCustomerPO)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {id, po_item, nomor_po, ...body} = input;
				await OrmCustomerPO.update(
					{...body, id: generateId(), nomor_po},
					{where: {id}},
				);
				const poItemPromises = po_item?.map(item =>
					OrmCustomerPOItem.upsert({
						...item,
						id: item.id || generateId(),
						nomor_po,
					}),
				);
				await Promise.all(poItemPromises);
				return {message: 'Success'};
			});
		}),

	customer_po_delete: procedure
		.input(tCustomerPO)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {nomor_po} = input;
				await OrmCustomerPOItem.destroy({where: {nomor_po}});
				await OrmCustomerPO.destroy({where: {nomor_po}});
				return {message: 'Success'};
			});
		}),
};

export default customer_poRouters;

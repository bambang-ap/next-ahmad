import {z} from 'zod';

import {tCustomerPO, tPOItem} from '@appTypes/app.zod';
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmPOItemSppbIn,
} from '@database';
import {checkCredentialV2, generateId} from '@server';
import {procedure, router} from '@trpc';

const customer_poRouters = router({
	get: procedure
		.input(
			tCustomerPO
				.pick({id: true})
				.partial()
				.extend({
					type: z.literal('customer_po'),
				}),
		)
		.query(async ({ctx: {req, res}, input: {id: nomor_po}}) => {
			return checkCredentialV2(req, res, async () => {
				const allPO = await OrmCustomerPO.findAll(
					nomor_po ? {where: {id: nomor_po}} : undefined,
				);
				const joinedPOPromises = allPO.map(async ({dataValues}) => {
					const po_item = await OrmCustomerPOItem.findAll({
						where: {id_po: dataValues.id},
					});
					const customer = await OrmCustomer.findOne({
						where: {id: dataValues.id_customer},
					});
					return {
						...dataValues,
						customer: customer?.dataValues,
						po_item: po_item.map(item => item.dataValues),
					};
				});

				return Promise.all(joinedPOPromises);
			});
		}),

	add: procedure
		.input(
			tCustomerPO
				.omit({id: true})
				.extend({po_item: tPOItem.omit({id_po: true, id: true}).array()}),
		)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {po_item, ...body} = input;
				const {dataValues: createdPo} = await OrmCustomerPO.create({
					...body,
					id: generateId(),
				});
				const poItemPromises = po_item?.map(item =>
					OrmCustomerPOItem.create({
						...item,
						id: generateId(),
						id_po: createdPo.id,
					}),
				);
				await Promise.all(poItemPromises ?? []);
				return {message: 'Success'};
			});
		}),

	update: procedure
		.input(
			tCustomerPO.extend({
				po_item: tPOItem.or(tPOItem.omit({id_po: true, id: true})).array(),
			}),
		)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {id, po_item, ...body} = input;
				await OrmCustomerPO.update(body, {where: {id}});
				const poItemPromises = po_item?.map(({id, ...item}) =>
					OrmCustomerPOItem.upsert({
						...item,
						id: id || generateId(),
						id_po: input.id,
					}),
				);
				await Promise.all(poItemPromises ?? []);
				return {message: 'Success'};
			});
		}),

	delete: procedure
		.input(z.string())
		.mutation(async ({input: id, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const dataSppb = await OrmCustomerSPPBIn.findAll({where: {id_po: id}});
				await Promise.all(
					dataSppb.map(async sppb => {
						return OrmPOItemSppbIn.destroy({
							where: {id_sppb_in: sppb.dataValues.id},
						});
					}),
				);
				await OrmCustomerSPPBIn.destroy({where: {id_po: id}});
				await OrmCustomerPOItem.destroy({where: {id_po: id}});
				await OrmCustomerPO.destroy({where: {id}});
				return {message: 'Success'};
			});
		}),
});

export default customer_poRouters;

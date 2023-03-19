import {z} from 'zod';

import {tCustomerSPPBIn, tUpsertSppbIn, zId} from '@appTypes/app.zod';
import {
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmPOItemSppbIn,
} from '@database';
import {checkCredentialV2, generateId} from '@server';
import {procedure, router} from '@trpc';

const sppbRouters = router({
	get: procedure
		.input(
			z.object({
				type: z.literal('sppb_in'),
				where: tCustomerSPPBIn.partial().optional(),
			}),
		)
		.query(({ctx: {req, res}, input: {where}}) => {
			return checkCredentialV2(req, res, async () => {
				const dataSppb = await OrmCustomerSPPBIn.findAll({where});
				const promises = dataSppb.map(async data => {
					const detailPo = await OrmCustomerPO.findOne({
						where: {id: data.dataValues.id_po},
					});

					const items = await OrmPOItemSppbIn.findAll({
						where: {id_sppb_in: data.dataValues.id},
					});

					const promiseItemDetails = items.map(async item => {
						const itemDetail = await OrmCustomerPOItem.findOne({
							where: {id: item.dataValues.id_item},
						});

						return {...item.dataValues, itemDetail: itemDetail?.dataValues};
					});

					return {
						...data.dataValues,
						detailPo: detailPo?.dataValues,
						items: await Promise.all(promiseItemDetails),
					};
				});

				return Promise.all(promises);
			});
		}),
	upsert: procedure
		.input(tUpsertSppbIn)
		.mutation(({ctx: {req, res}, input}) => {
			return checkCredentialV2(req, res, async () => {
				const {id, po_item, ...rest} = input;

				const [{dataValues: createdSppb}] = await OrmCustomerSPPBIn.upsert({
					...rest,
					id: id || generateId(),
				});

				const existingPoItemPromises = (
					await OrmPOItemSppbIn.findAll({
						where: {id_sppb_in: createdSppb.id},
					})
				).map(({dataValues}) => {
					const itemFounded = po_item.find(item => item.id === dataValues.id);
					if (!itemFounded) {
						return OrmPOItemSppbIn.destroy({where: {id: dataValues.id}});
					}
				});

				await Promise.all(existingPoItemPromises).then(() => {
					po_item.forEach(item => {
						const {id: idItem, id_item, id_sppb_in} = item;

						OrmPOItemSppbIn.upsert({
							...item,
							id_item,
							id_sppb_in: id_sppb_in || id || (createdSppb.id as string),
							id: idItem || generateId(),
						});
					});
				});
			});
		}),
	delete: procedure
		.input(zId.partial())
		.mutation(({ctx: {req, res}, input: {id}}) => {
			return checkCredentialV2(req, res, async () => {
				return OrmPOItemSppbIn.destroy({where: {id_sppb_in: id}}).then(() =>
					OrmCustomerSPPBIn.destroy({where: {id}}),
				);
			});
		}),
});

export default sppbRouters;

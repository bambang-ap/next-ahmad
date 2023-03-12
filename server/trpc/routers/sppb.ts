import {z} from 'zod';

import {tCustomerSPPBIn, tUpsertSppbIn, uSPPB} from '@appTypes/app.zod';
import {OrmCustomerPO, OrmCustomerSPPBIn, OrmPOItemSppbIn} from '@database';
import {checkCredentialV2, generateId, MAPPING_CRUD_ORM} from '@server';
import {procedure, router} from '@trpc';

const sppbRouters = router({
	get: procedure
		.input(
			z.object({
				type: z.literal('sppb_in'),
			}),
		)
		.query(({ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const dataSppb = await OrmCustomerSPPBIn.findAll();
				const promises = dataSppb.map(async data => {
					const detailPo = await OrmCustomerPO.findOne({
						where: {id: data.dataValues.id_po},
					});

					const items = await OrmPOItemSppbIn.findAll({
						where: {id_sppb_in: data.dataValues.id},
					});

					return {
						...data.dataValues,
						detailPo: detailPo?.dataValues,
						items: items.map(item => item.dataValues),
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
		}),
	delete: procedure
		.input(
			tCustomerSPPBIn.pick({id: true}).extend({
				target: uSPPB,
			}),
		)
		.mutation(({ctx: {req, res}, input: {id, target}}) => {
			return checkCredentialV2(req, res, () => {
				const orm = MAPPING_CRUD_ORM[target];
				return orm.destroy({where: {id}});
			});
		}),
});

export default sppbRouters;

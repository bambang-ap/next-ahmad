import {z} from 'zod';

import {
	ItemsSppb,
	tCustomerPO,
	TCustomerSPPBIn,
	tCustomerSPPBIn,
	uSPPB,
} from '@appTypes/app.zod';
import {OrmCustomerSPPBIn} from '@database';
import {checkCredentialV2, generateId, MAPPING_CRUD_ORM} from '@server';
import {procedure, router} from '@trpc';
import {appRouter} from '@trpc/routers';

const sppbRouters = router({
	get: procedure
		.input(
			z.object({
				where: tCustomerPO.pick({nomor_po: true, id: true}).partial(),
			}),
		)
		.query(({ctx: {req, res}, input: {where}}) => {
			const {nomor_po} = where;

			return checkCredentialV2(
				req,
				res,
				async (): Promise<ItemsSppb | undefined> => {
					const routerCaller = appRouter.createCaller({req, res});

					// @ts-ignore
					const d = (await OrmCustomerSPPBIn.findAll({
						where,
					})) as TCustomerSPPBIn[];
					const dd = await routerCaller.customer_po.get({
						type: 'customer_po',
						nomor_po,
					});

					const assignedQty = dd?.[0]?.po_item?.map(item => {
						const qty = d.reduce((o, y) => {
							const hdjs = y?.items?.find(e => e.id === item.id);
							return o - (hdjs?.qty ?? 0);
						}, item.qty);

						return {qty, id: item.id};
					});

					return assignedQty;
				},
			);
		}),
	upsert: procedure
		.input(
			z.object({
				target: uSPPB,
				data: tCustomerSPPBIn,
			}),
		)
		.mutation(({ctx: {req, res}, input: {data, target}}) => {
			return checkCredentialV2(req, res, () => {
				const {id, ...rest} = data;
				const orm = MAPPING_CRUD_ORM[target];
				return orm.upsert({...rest, id: id || generateId()});
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

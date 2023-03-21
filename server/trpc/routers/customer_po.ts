import {qtyList, UQtyList} from 'pages/app/customer/po/ModalChild';
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
					const poItem = await OrmCustomerPOItem.findAll({
						where: {id_po: dataValues.id},
					});

					const customer = await OrmCustomer.findOne({
						where: {id: dataValues.id_customer},
					});

					const itemInSppbIn = poItem.map(async ({dataValues: item}) => {
						type ItemRet = {
							qty: Record<UQtyList, number>;
							closed: Record<UQtyList, boolean>;
						};

						const itemSppb = await OrmPOItemSppbIn.findAll({
							where: {id_item: item.id},
						});

						const {closed} = itemSppb.reduce<ItemRet>(
							(ret, {dataValues: ii}) => {
								qtyList.forEach(num => {
									const qtyKey = `qty${num}` as const;
									if (!ret.qty[qtyKey]) ret.qty[qtyKey] = 0;
									ret.qty[qtyKey] += ii[qtyKey] ?? 0;

									ret.closed[qtyKey] = (item[qtyKey] ?? 0) === ret.qty[qtyKey];
								});

								return ret;
							},
							{qty: {}, closed: {qty1: false}} as any,
						);

						return {...item, isClosed: !Object.values(closed).includes(false)};
					});

					const po_item = await Promise.all(itemInSppbIn);

					return {
						...dataValues,
						po_item,
						customer: customer?.dataValues,
						isClosed: !po_item.find(e => e.isClosed === false),
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
				po_item: tPOItem
					.or(tPOItem.partial({id: true}).omit({id_po: true}))
					.array(),
			}),
		)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(req, res, async () => {
				const {id, po_item, ...body} = input;

				await OrmCustomerPO.upsert({...body, id});

				const poItemPromises = po_item?.map(({id: itemId, ...item}) => {
					const isExist = po_item.find(e => e.id === itemId);

					if (!isExist) OrmCustomerPOItem.destroy({where: {id: itemId}});

					return OrmCustomerPOItem.upsert({
						...item,
						id: itemId || generateId(),
						id_po: input.id,
					});
				});

				const existingPoItems = await OrmCustomerPOItem.findAll({
					where: {id_po: id},
				});

				const excludeItem = existingPoItems.filter(
					({dataValues: {id: itemId}}) => {
						const item = po_item.find(e => e.id === itemId);
						return !item;
					},
				);

				await Promise.all(poItemPromises);
				await Promise.all(excludeItem.map(e => e.destroy()));

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

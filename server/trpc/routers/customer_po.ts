import {Includeable, Op} from 'sequelize';
import {z} from 'zod';

import {PagingResult, TMasterItem, UQtyList} from '@appTypes/app.type';
import {
	tableFormValue,
	TCustomer,
	TCustomerPO,
	tCustomerPO,
	TPOItem,
	tPOItem,
	zId,
} from '@appTypes/app.zod';
import {defaultLimit, qtyList, Success} from '@constants';
import {
	getCurrentPOStatus,
	orderPages,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmMasterItem,
	OrmPOItemSppbIn,
	poGetAttributes,
	wherePagesV2,
} from '@database';
import {PO_STATUS} from '@enum';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

import {appRouter} from '.';

export type PoGetV2 = ReturnType<typeof poGetAttributes>['Ret'];
export type GetPage = PagingResult<GetPageRows>;
export type GetPageRows = TCustomerPO & {
	status: PO_STATUS;
	OrmCustomer?: TCustomer;
	isClosed?: boolean;
	po_item: (TPOItem & {OrmMasterItem: TMasterItem} & {isClosed?: boolean})[];
};

type III = Pick<
	GetPageRows,
	'id' | 'id_customer' | 'po_item' | 'isClosed' | 'nomor_po'
>;

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
		.query(async ({ctx, input}): Promise<III[]> => {
			const routerCaller = appRouter.createCaller(ctx);

			const data = await routerCaller.customer_po.getPage({
				...input,
				limit: 9999,
			});

			return data.rows.map(({po_item, id_customer, id, isClosed, nomor_po}) => {
				return {po_item, id_customer, id, isClosed, nomor_po} as III;
			});
		}),
	getV2: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, search, page} = input;

		const {A, B, C, D} = poGetAttributes();

		return checkCredentialV2(ctx, async () => {
			const {count, rows} = await OrmCustomerPO.findAndCountAll({
				limit,
				attributes: A.keys,
				offset: (page - 1) * limit,
				order: orderPages<PoGetV2>({createdAt: false}),
				where: wherePagesV2<PoGetV2>(
					['nomor_po', '$OrmCustomer.name$'],
					search,
				),
				include: [
					{model: OrmCustomer, attributes: B.keys},
					{
						separate: true,
						attributes: C.keys,
						model: OrmCustomerPOItem,
						include: [{model: OrmMasterItem, attributes: D.keys}],
					},
				],
			});

			const promisedRows = rows.map(async e => {
				const val = e.dataValues as PoGetV2;

				const status = await getCurrentPOStatus(val.id);

				return {...val, status};
			});

			return pagingResult(count, page, limit, await Promise.all(promisedRows));
		});
	}),
	getPage: procedure
		.input(
			tableFormValue.partial().extend({
				type: z.literal('customer_po').optional(),
				id: z.string().array().or(z.string()).optional(),
			}),
		)
		.query(async ({ctx: {req, res}, input}) => {
			const {id: idPo, limit = defaultLimit, page = 1, search} = input;

			return checkCredentialV2({req, res}, async (): Promise<GetPage> => {
				const include: Includeable = OrmCustomer;
				const limitation = {
					limit,
					include,
					offset: (page - 1) * limit,
					where: {
						...(search && {
							nomor_po: {
								[Op.iLike]: `%${search}%`,
							},
						}),
					},
				};

				const {count, rows: allPO} = await OrmCustomerPO.findAndCountAll(
					idPo ? {where: {id: idPo}, include} : limitation,
				);
				const joinedPOPromises = allPO.map<Promise<GetPage['rows'][number]>>(
					async po => {
						const dataValues = po.toJSON() as TCustomerPO & {
							OrmCustomer?: TCustomer;
						};
						const poItem = await OrmCustomerPOItem.findAll({
							where: {id_po: dataValues.id},
							include: OrmMasterItem,
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

										ret.closed[qtyKey] =
											(item[qtyKey] ?? 0) === ret.qty[qtyKey];
									});

									return ret;
								},
								{qty: {}, closed: {qty1: false}} as any,
							);

							return {
								...(item as TPOItem & {OrmMasterItem: TMasterItem}),
								isClosed: !Object.values(closed).includes(false),
							};
						});

						const po_item = await Promise.all(itemInSppbIn);

						const status = await getCurrentPOStatus(po.dataValues.id);

						return {
							...dataValues,
							po_item,
							status,
							isClosed: !po_item.find(e => e.isClosed === false),
						};
					},
				);

				const allDataPO = await Promise.all(joinedPOPromises);
				// ORM.close();
				return pagingResult(count, page, limit, allDataPO);
			});
		}),
	add: procedure
		.input(
			tCustomerPO
				.omit({id: true})
				.extend({po_item: tPOItem.omit({id_po: true, id: true}).array()}),
		)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2({req, res}, async () => {
				const {po_item, ...body} = input;
				const {dataValues: createdPo} = await OrmCustomerPO.create({
					...body,
					id: generateId('PO_'),
				});
				po_item.forEach(async item => {
					await OrmCustomerPOItem.create({
						...item,
						id: generateId('POI_'),
						id_po: createdPo.id,
					});
				});
				// const poItemPromises = po_item?.map(item =>
				// 	OrmCustomerPOItem.create({
				// 		...item,
				// 		id: generateId("POI_"),
				// 		id_po: createdPo.id,
				// 	}),
				// );
				// await Promise.all(poItemPromises ?? []);
				return Success;
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
			return checkCredentialV2({req, res}, async () => {
				const {id, po_item, ...body} = input;

				await OrmCustomerPO.upsert({...body, id});

				const poItemPromises = po_item?.map(({id: itemId, ...item}) => {
					const isExist = po_item.find(e => e.id === itemId);

					if (!isExist) OrmCustomerPOItem.destroy({where: {id: itemId}});

					return OrmCustomerPOItem.upsert({
						...item,
						id: itemId || generateId('POI_'),
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

				return Success;
			});
		}),

	delete: procedure
		.input(zId)
		.mutation(async ({input: {id}, ctx: {req, res}}) => {
			return checkCredentialV2({req, res}, async () => {
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
				return Success;
			});
		}),
});

export default customer_poRouters;

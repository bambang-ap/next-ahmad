import {Op} from 'sequelize';
import {z} from 'zod';

import {
	PagingResult,
	TCustomerPO,
	TCustomerSPPBIn,
	TPOItem,
	TPOItemSppbIn,
} from '@appTypes/app.type';
import {
	tableFormValue,
	tCustomerSPPBIn,
	tUpsertSppbIn,
	zId,
} from '@appTypes/app.zod';
import {defaultLimit} from '@constants';
import {
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmPOItemSppbIn,
} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

import {appRouter} from '.';

type GetPage = PagingResult<GetPageRows>;
type GetPageRows = TCustomerSPPBIn & {
	detailPo?: TCustomerPO;
	items?: (TPOItemSppbIn & {itemDetail?: TPOItem})[];
};

const sppbRouters = router({
	get: procedure
		.input(
			z.object({
				type: z.literal('sppb_in'),
				where: tCustomerSPPBIn.partial().optional(),
			}),
		)
		.query(async ({ctx, input}): Promise<GetPage['rows']> => {
			const routerCaller = appRouter.createCaller(ctx);

			const {rows} = await routerCaller.sppb.getPage({
				...input,
				limit: 99999999,
			});

			return rows;
		}),
	getPage: procedure
		.input(
			tableFormValue.partial().extend({
				type: z.literal('sppb_in'),
				where: tCustomerSPPBIn.partial().optional(),
			}),
		)
		.query(({ctx: {req, res}, input}) => {
			const {where, limit = defaultLimit, page = 1, search} = input;

			const limitation = {
				limit,
				offset: (page - 1) * limit,
				where: {
					...(search && {
						nomor_surat: {
							[Op.iLike]: `%${search}%`,
						},
					}),
				},
			};

			return checkCredentialV2(req, res, async (): Promise<GetPage> => {
				const {count, rows: dataSppb} = await OrmCustomerSPPBIn.findAndCountAll(
					where ? {where} : limitation,
				);
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

				const allDataSppbIn = await Promise.all(promises);

				return pagingResult(count, page, limit, allDataSppbIn);
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
					return null;
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

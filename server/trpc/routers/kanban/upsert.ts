import {tKanbanUpsert} from '@appTypes/app.zod';
import {Success} from '@constants';
import {OrmDocument, OrmKanban, OrmKanbanItem} from '@database';
import {checkCredentialV2, generateId} from '@server';
import {procedure} from '@trpc';
import {TRPCError} from '@trpc/server';

import {appRouter} from '../';

export const kanbanUpsert = {
	upsert: procedure
		.input(tKanbanUpsert)
		.mutation(async ({input, ctx: {req, res}}) => {
			const routerCaller = appRouter.createCaller({req, res});
			return checkCredentialV2({req, res}, async session => {
				const docData = await OrmDocument.findOne();

				if (!docData) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Doc number not found',
					});
				}

				const {id, doc_id, items: kanban_items, createdBy, ...rest} = input;
				const no_kanban = await routerCaller.kanban.getInvoice();
				const hasKanban = id ? await OrmKanban.findOne({where: {id}}) : null;
				const [createdKanban] = await OrmKanban.upsert({
					...rest,
					nomor_kanban: hasKanban?.dataValues?.nomor_kanban ?? no_kanban,
					createdBy: createdBy ?? session.user?.id!,
					updatedBy: session.user?.id!,
					id: id || generateId('KNB_'),
					doc_id: doc_id || docData.dataValues.id,
				});

				const itemPromises = Object.entries(kanban_items)?.map(
					([id_item, {id: idItemKanban, id_sppb_in, ...restItemKanban}], i) => {
						if (id_sppb_in !== rest.id_sppb_in) return null;

						return OrmKanbanItem.upsert({
							...restItemKanban,
							id_item,
							id: idItemKanban ?? generateId('KNBI_'),
							id_mesin: rest.list_mesin[id_item]!?.[0]!,
							id_kanban: createdKanban.dataValues.id,
						});
					},
				);
				// const dataScan = await OrmScan.findOne({
				// 	where: {id_kanban: createdKanban.dataValues.id},
				// });
				// const itemKanbanResult =
				await Promise.all(itemPromises);
				// const item_from_kanban = itemKanbanResult.reduce((ret, item) => {
				// 	const dataItem = item?.[0].dataValues as TKanbanItem;
				// 	const data = qtyMap(({qtyKey}) => {
				// 		if (!dataItem?.[qtyKey]) return false;
				// 		return {[qtyKey]: dataItem?.[qtyKey]};
				// 	}, true).reduce((a, b) => ({...a, ...b}), {});
				// 	const result = {[dataItem.id]: data} as TScan['item_from_kanban'];
				// 	return {...ret, ...result};
				// }, dataScan?.dataValues.item_from_kanban);

				// await OrmScan.upsert({
				// 	...dataScan?.dataValues!,
				// 	id: dataScan?.dataValues.id || generateId('SCAN_'),
				// 	id_customer: input.id_customer,
				// 	id_kanban: createdKanban.dataValues.id,
				// 	item_from_kanban,
				// });

				return Success;
			});
		}),
};

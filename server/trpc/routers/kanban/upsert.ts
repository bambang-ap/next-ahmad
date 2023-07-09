import {tKanbanUpsert} from "@appTypes/app.zod";
import {Success} from "@constants";
import {OrmDocument, OrmKanban, OrmKanbanItem, OrmScan} from "@database";
import {checkCredentialV2, generateId} from "@server";
import {procedure} from "@trpc";
import {TRPCError} from "@trpc/server";

import {appRouter} from "../";

export const kanbanUpsert = {
	upsert: procedure
		.input(tKanbanUpsert)
		.mutation(async ({input, ctx: {req, res}}) => {
			const routerCaller = appRouter.createCaller({req, res});
			return checkCredentialV2({req, res}, async session => {
				const docData = await OrmDocument.findOne();

				if (!docData) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Doc number not found",
					});
				}

				const {id, doc_id, items: kanban_items, createdBy, ...rest} = input;
				const no_kanban = await routerCaller.kanban.getInvoice();
				const hasKanban = await OrmKanban.findOne({where: {id}});
				const [createdKanban] = await OrmKanban.upsert({
					...rest,
					nomor_kanban: hasKanban?.dataValues?.nomor_kanban ?? no_kanban,
					createdBy: createdBy ?? session.user?.id!,
					updatedBy: session.user?.id!,
					id: id || generateId("KNB"),
					doc_id: doc_id || docData.dataValues.id,
				});

				await OrmScan.findOrCreate({
					where: {id_kanban: createdKanban.dataValues.id},
					// @ts-ignore
					defaults: {
						id: generateId("SCAN"),
						id_customer: input.id_customer,
						id_kanban: createdKanban.dataValues.id,
					},
				});

				const itemPromises = Object.entries(kanban_items)?.map(
					([id_item, {id: idItemKanban, id_sppb_in, ...restItemKanban}]) => {
						if (id_sppb_in !== rest.id_sppb_in) return null;

						return OrmKanbanItem.upsert({
							...restItemKanban,
							id_item,
							id: idItemKanban ?? generateId("KNBI"),
							id_kanban: createdKanban.dataValues.id,
						});
					},
				);
				await Promise.all(itemPromises);
				return Success;
			});
		}),
};

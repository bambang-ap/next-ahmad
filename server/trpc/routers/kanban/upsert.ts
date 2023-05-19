import {tKanbanUpsert} from "@appTypes/app.zod";
import {OrmDocument, OrmKanban, OrmKanbanItem, OrmScan} from "@database";
import {checkCredentialV2, generateId} from "@server";
import {procedure} from "@trpc";
import {TRPCError} from "@trpc/server";

export const kanbanUpsert = procedure
	.input(tKanbanUpsert)
	.mutation(async ({input, ctx: {req, res}}) => {
		return checkCredentialV2({req, res}, async session => {
			const docData = await OrmDocument.findOne();

			if (!docData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Doc number not found",
				});
			}

			const {id, doc_id, items: kanban_items, createdBy, ...rest} = input;
			const [createdKanban] = await OrmKanban.upsert({
				...rest,
				createdBy: createdBy ?? session.user?.id!,
				updatedBy: session.user?.id!,
				id: id || generateId(),
				doc_id: doc_id || docData.dataValues.id,
			});

			await OrmScan.findOrCreate({
				where: {id_kanban: createdKanban.dataValues.id},
				// @ts-ignore
				defaults: {id_kanban: createdKanban.dataValues.id, id: generateId()},
			});

			const itemPromises = Object.entries(kanban_items)?.map(
				([id_item, {id: idItemKanban, id_sppb_in, ...restItemKanban}]) => {
					if (id_sppb_in !== rest.id_sppb_in) return null;

					return OrmKanbanItem.upsert({
						...restItemKanban,
						id_item,
						id: idItemKanban ?? generateId(),
						id_kanban: createdKanban.dataValues.id,
					});
				},
			);
			await Promise.all(itemPromises);
			return {message: "Success"};
		});
	});

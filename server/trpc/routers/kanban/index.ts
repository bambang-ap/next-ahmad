import {z} from "zod";

import {zId} from "@appTypes/app.zod";
import {Success} from "@constants";
import {OrmKanban, OrmKanbanItem, OrmScan} from "@database";
import {checkCredentialV2, genInvoice} from "@server";
import {procedure, router} from "@trpc";
import {TRPCError} from "@trpc/server";

import {kanbanGet} from "./get";
import {kanbanImage} from "./image";
import {kanbanUpsert} from "./upsert";

const kanbanRouters = router({
	...kanbanGet,
	...kanbanUpsert,
	...kanbanImage,
	getInvoice: procedure.query(() =>
		genInvoice(
			OrmKanban,
			"KNB/IMI",
			value => value?.nomor_kanban,
			"nomor_kanban",
		),
	),
	delete: procedure
		.input(zId.partial())
		.mutation(async ({input: {id}, ctx: {req, res}}) => {
			return checkCredentialV2({req, res}, async () => {
				if (!id) {
					throw new TRPCError({code: "BAD_REQUEST", message: "ID is required"});
				}

				await OrmScan.destroy({where: {id_kanban: id}});
				await OrmKanbanItem.destroy({where: {id_kanban: id}});
				await OrmKanban.destroy({where: {id}});

				return Success;
			});
		}),
	deleteItem: procedure
		.input(z.string().optional())
		.mutation(async ({input: id, ctx: {req, res}}) => {
			return checkCredentialV2({req, res}, async () => {
				if (!id) {
					// throw new TRPCError({code: "BAD_REQUEST", message: "ID is required"});
					return {message: "Failed"};
				}

				await OrmKanbanItem.destroy({where: {id}});

				return Success;
			});
		}),
});

export default kanbanRouters;

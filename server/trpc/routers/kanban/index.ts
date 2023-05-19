import {Op} from "sequelize";
import {z} from "zod";

import {TKanban} from "@appTypes/app.zod";
import {OrmKanban, OrmKanbanItem, OrmScan} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";
import {TRPCError} from "@trpc/server";

import {kanbanGet} from "./get";
import {kanbanUpsert} from "./upsert";

const kanbanRouters = router({
	get: kanbanGet,
	upsert: kanbanUpsert,
	images: procedure.query(({ctx: {req, res}}) => {
		return checkCredentialV2({req, res}, async () => {
			const images = await OrmKanban.findAll({
				where: {image: {[Op.ne]: null}},
				attributes: ["image", "keterangan"] as (keyof TKanban)[],
			});

			return images?.map(({dataValues}) => {
				const {image, keterangan} = dataValues;

				return {image, keterangan};
			});
		});
	}),
	delete: procedure
		.input(z.string().optional())
		.mutation(async ({input: id, ctx: {req, res}}) => {
			return checkCredentialV2({req, res}, async () => {
				if (!id) {
					throw new TRPCError({code: "BAD_REQUEST", message: "ID is required"});
				}

				await OrmScan.destroy({where: {id_kanban: id}});
				await OrmKanbanItem.destroy({where: {id_kanban: id}});
				await OrmKanban.destroy({where: {id}});

				return {message: "Success"};
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

				return {message: "Success"};
			});
		}),
});

export default kanbanRouters;

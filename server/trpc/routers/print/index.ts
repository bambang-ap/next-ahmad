import {z} from "zod";

import {TScanTarget} from "@appTypes/app.type";
import {printSppbOutAttributes, wherePagesV3} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";

import {printKanbanRouter} from "./kanban";
import {printScanRouter} from "./scan";

export type SppbOutGet = ReturnType<typeof printSppbOutAttributes>["Ret"];

const printRouters = router({
	...printKanbanRouter,
	...printScanRouter,
	sppb: router({
		out: procedure
			.input(z.object({id: z.string().array()}))
			.query(({ctx, input}) => {
				type RetExport = typeof Ret;
				const {
					sjOut,
					vehicle,
					customer,
					outItem,
					inItem,
					item,
					poItem,
					po,
					sjIn,
					kanban,
					scan,
					doc,
					Ret,
				} = printSppbOutAttributes();

				return checkCredentialV2(ctx, async (): Promise<SppbOutGet[]> => {
					const data = await sjOut.model.findAll({
						logging: true,
						where: wherePagesV3<typeof Ret>({
							id: input.id,
							"$dOutItems.dInItem.dSJIn.dKanbans.dScans.status$":
								"finish_good" as TScanTarget,
						}),
						attributes: sjOut.attributes,
						include: [
							vehicle,
							customer,
							{
								...outItem,
								include: [
									{
										...inItem,
										include: [
											item,
											{...poItem, include: [po]},
											{
												...sjIn,
												include: [{...kanban, include: [scan, doc]}],
											},
										],
									},
								],
							},
						],
					});

					return data.map(e => e.dataValues as unknown as RetExport);
				});
			}),
	}),
});

export default printRouters;

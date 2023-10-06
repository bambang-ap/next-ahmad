import {TScanTarget} from "@appTypes/app.type";
import {zIds} from "@appTypes/app.zod";
import {dScan, printSppbOutAttributes, wherePagesV3} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";

import {printKanbanRouter} from "./kanban";
import {printScanRouter} from "./scan";

export type SppbOutGet = ReturnType<typeof printSppbOutAttributes>["Ret"];

const printRouters = router({
	...printKanbanRouter,
	...printScanRouter,
	sppb: router({
		out: procedure.input(zIds).query(({ctx, input}) => {
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
				rejItem,
				scnItem,
				Ret,
			} = printSppbOutAttributes();

			return checkCredentialV2(ctx, async (): Promise<SppbOutGet[]> => {
				const data = await sjOut.model.findAll({
					where: wherePagesV3<typeof Ret>({
						id: input.ids,
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
											include: [
												{
													...kanban,
													include: [
														doc,
														{
															...scan,
															include: [
																scnItem,
																{
																	...scan,
																	as: dScan._aliasReject,
																	include: [{...scnItem, include: [rejItem]}],
																},
															],
														},
													],
												},
											],
										},
									],
								},
							],
						},
					],
				});

				return data.map(e => e.toJSON() as unknown as RetExport);
			});
		}),
	}),
});

export default printRouters;

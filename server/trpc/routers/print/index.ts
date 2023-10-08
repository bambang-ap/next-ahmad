import {TScanTarget} from "@appTypes/app.type";
import {zIds} from "@appTypes/app.zod";
import {
	getPrintPoAttributes,
	printSppbOutAttributes,
	wherePagesV3,
} from "@database";
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
				sjInInclude,
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
									include: [item, sjInInclude, {...poItem, include: [po]}],
								},
							],
						},
					],
				});

				return data.map(e => e.toJSON() as unknown as RetExport);
			});
		}),
	}),
	po: procedure.input(zIds).query(({ctx, input}) => {
		type RetOutput = typeof Ret;

		const {Ret, Po, poIncludeAble} = getPrintPoAttributes();

		return checkCredentialV2(ctx, async (): Promise<RetOutput[]> => {
			const dataPO = await Po.model.findAll({
				logging: true,
				raw: true,
				nest: true,
				where: {id: input.ids},
				attributes: Po.attributes,
				include: poIncludeAble,
			});

			return dataPO as unknown as RetOutput[];
		});
	}),
});

export default printRouters;

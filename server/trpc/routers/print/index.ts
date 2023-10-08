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

		const {Ret, Po, Scan, ScanItem, RetScnItem, poIncludeAble} =
			getPrintPoAttributes();

		return checkCredentialV2(ctx, async (): Promise<RetOutput[]> => {
			const dataPO = await Po.model.findAll({
				logging: true,
				raw: true,
				nest: true,
				where: {id: input.ids},
				attributes: Po.attributes,
				include: poIncludeAble,
			});

			const promisedData = dataPO.map(async data => {
				const val = data as unknown as RetOutput;
				const {dPoItems} = val;
				const {dInItems} = dPoItems;
				const {dKnbItems} = dInItems ?? {};

				const id_kanban_item = dKnbItems?.id;

				if (!id_kanban_item) return val;

				const dataScanItem = await ScanItem.model.findAll({
					include: [Scan],
					where: {id_kanban_item},
				});

				const ret: RetOutput = {
					...val,
					dPoItems: {
						...dPoItems,
						dInItems: {
							...dInItems!,
							dKnbItems: {
								...dKnbItems,
								dScanItems: dataScanItem.map(
									e => e.toJSON() as unknown as typeof RetScnItem,
								),
							},
						},
					},
				};

				return ret;
			});

			return Promise.all(promisedData);
		});
	}),
});

export default printRouters;

import {z} from "zod";

import {
	tScanItemReject,
	tScanNew,
	tScanNewItem,
	UnitQty,
} from "@appTypes/app.zod";
import {Success} from "@constants";
import {dRejItem, dScan, dScanItem, OrmKanbanItem} from "@database";
import {REJECT_REASON} from "@enum";
import {checkCredentialV2, generateId} from "@server";
import {procedure} from "@trpc";
import {atLeastOneDefined, qtyMap, qtyReduce} from "@utils";

export const updateScan = {
	updateV3: procedure
		.input(
			tScanNew
				.partial({id: true})
				.extend({
					items: z.record(tScanNewItem.partial({id: true, id_scan: true})),
					prevItems: z.record(tScanNewItem.partial()),
					tempRejectedItems: z.record(tScanNewItem.partial()).optional(),
				})
				.and(
					z.union([
						z.object({reject: z.literal(false)}),
						z.object({
							reject: z.literal(true),
							reason: tScanItemReject.shape.reason,
							rejectItems: z
								.record(tScanItemReject.partial().required({qty1: true}))
								.refine(atLeastOneDefined),
						}),
					]),
				),
		)
		.mutation(({ctx, input}) => {
			const {items, prevItems, status, id_kanban, ...scanData} = input;

			async function updateOT(id_item: string, outStandingQty?: UnitQty) {
				const kanbanItem = await OrmKanbanItem.findOne({
					where: {id: id_item},
				});

				if (!!kanbanItem) {
					const kanbanItemQty = qtyReduce((ret, {qtyKey}) => {
						const aa = outStandingQty?.[qtyKey];
						const bb = kanbanItem.dataValues?.[qtyKey];
						const curQty = parseFloat(aa?.toString() ?? "0");
						const prevQty = parseFloat(bb?.toString() ?? "0");

						return {
							...ret,
							[qtyKey]: !!prevQty ? prevQty - curQty : aa,
						};
					});

					await OrmKanbanItem.update(
						{...kanbanItem.dataValues, ...kanbanItemQty},
						{where: {id: id_item}},
					);
				}
			}

			return checkCredentialV2(ctx, async () => {
				const existingScan = await dScan.findOne({
					where: {id_kanban, status},
				});
				const [{dataValues: updatedScan}] = await dScan.upsert({
					...scanData,
					status,
					id_kanban,
					id: existingScan?.dataValues.id ?? generateId("SN_"),
				});

				for (const [id_item, item] of Object.entries(items)) {
					const qtys = qtyReduce((ret, {qtyKey}) => {
						return {...ret, [qtyKey]: item[qtyKey]};
					});

					const existingItem = await dScanItem.findOne({
						where: {id_kanban_item: id_item, id_scan: updatedScan.id},
					});
					const [{dataValues}] = await dScanItem.upsert({
						...qtys,
						id_scan: updatedScan.id,
						id_kanban_item: id_item,
						item_from_kanban: item.item_from_kanban,
						id: existingItem?.dataValues.id ?? generateId("SNI_"),
					});

					let outStandingQty = qtyReduce((ret, {qtyKey}) => {
						const curQty = parseFloat(item?.[qtyKey]?.toString() ?? "0");
						const prevQty = parseFloat(
							prevItems?.[id_item]?.[qtyKey]?.toString() ?? "0",
						);
						return {...ret, [qtyKey]: prevQty - curQty};
					});

					if (input.reject) {
						const {rejectItems, reason} = input;

						const hasRejectValue = qtyMap(({qtyKey}) => {
							return !!rejectItems?.[id_item]?.[qtyKey];
						}).includes(true);

						if (hasRejectValue) {
							await dScan.update(
								{is_rejected: true},
								{where: {id: updatedScan.id}},
							);

							await dRejItem.create({
								...rejectItems?.[id_item]!,
								id: generateId("SIR_"),
								id_item: dataValues.id,
								reason,
							});

							if (reason === REJECT_REASON.RP) {
								const qtyOT = rejectItems?.[id_item]!;
								qtyMap(({qtyKey}) => {
									const a = outStandingQty[qtyKey]!;
									const b = parseFloat(qtyOT[qtyKey]?.toString() ?? "0");
									outStandingQty[qtyKey] = a - b;
								});
								await updateOT(id_item, qtyOT);
							}
						}
					}

					const hasOT =
						Object.values(outStandingQty).filter(
							qty => parseFloat(qty?.toString() ?? "0") > 0,
						).length > 0;

					if (hasOT) await updateOT(id_item, outStandingQty);
				}

				return Success;
			});
		}),
};

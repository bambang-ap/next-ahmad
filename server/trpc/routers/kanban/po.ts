import {Model} from "sequelize";

import {TMasterItem, UQtyList} from "@appTypes/app.type";
import {
	TCustomerPO,
	TCustomerSPPBIn,
	TKanbanItem,
	TPOItemSppbIn,
	zId,
} from "@appTypes/app.zod";
import {defaultExcludeColumn} from "@constants";
import {
	ORM,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";
import {qtyMap} from "@utils";

const kanbanPoRouters = router({
	get_customer: procedure.query(({ctx}) => {
		return checkCredentialV2(ctx, async () => {
			const data = await OrmCustomer.findAll({
				attributes: ["id", "name"] as KeyOf<TCustomerPO>,
			});
			return data.map(e => e.dataValues);
		});
	}),
	getRaw: procedure.input(zId).query(async ({input}) => {
		const [p] = await ORM.query(
			`SELECT "OrmCustomerPO"."id", "OrmCustomerPO"."nomor_po", "OrmCustomerSPPBIns"."id" AS "OrmCustomerSPPBIns.id", "OrmCustomerSPPBIns"."nomor_surat" AS "OrmCustomerSPPBIns.nomor_surat", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."id" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.id", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."id_item" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.id_item", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."master_item_id" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.master_item_id", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."id_sppb_in" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.id_sppb_in", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."qty1" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.qty1", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."qty2" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.qty2", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."qty3" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.qty3", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."createdAt" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.createdAt", "OrmCustomerSPPBIns->OrmPOItemSppbIns"."updatedAt" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.updatedAt", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems"."id" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmKanbanItems.id", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems"."id_item" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmKanbanItems.id_item", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems"."qty1" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmKanbanItems.qty1", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems"."qty2" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmKanbanItems.qty2", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems"."qty3" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmKanbanItems.qty3", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems"."createdAt" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmKanbanItems.createdAt", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems"."updatedAt" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmKanbanItems.updatedAt", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmMasterItem"."id" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmMasterItem.id", "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmMasterItem"."name" AS "OrmCustomerSPPBIns.OrmPOItemSppbIns.OrmMasterItem.name" FROM "po" AS "OrmCustomerPO" LEFT OUTER JOIN "customer_sppb_in" AS "OrmCustomerSPPBIns" ON "OrmCustomerPO"."id" = "OrmCustomerSPPBIns"."id_po" LEFT OUTER JOIN "po_item_sppb_in" AS "OrmCustomerSPPBIns->OrmPOItemSppbIns" ON "OrmCustomerSPPBIns"."id" = "OrmCustomerSPPBIns->OrmPOItemSppbIns"."id_sppb_in" LEFT OUTER JOIN "kanban_item" AS "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems" ON "OrmCustomerSPPBIns->OrmPOItemSppbIns"."id" = "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmKanbanItems"."id_item" LEFT OUTER JOIN "master_item" AS "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmMasterItem" ON "OrmCustomerSPPBIns->OrmPOItemSppbIns"."master_item_id" = "OrmCustomerSPPBIns->OrmPOItemSppbIns->OrmMasterItem"."id" WHERE "OrmCustomerPO"."id_customer" = '${input.id}' ORDER BY "OrmCustomerPO"."createdAt" DESC, "OrmCustomerPO"."tgl_po" ASC, "OrmCustomerPO"."nomor_po" ASC;`,
		);

		return p;
	}),
	get: procedure.input(zId).query(async ({ctx, input}) => {
		type GG = TPOItemSppbIn & {
			isClosed: boolean;
			OrmMasterItem: Pick<TMasterItem, "id" | "name">;
			OrmKanbanItems: TKanbanItem[];
		};
		type KJD = Pick<TCustomerSPPBIn, "id" | "nomor_surat"> & {
			isClosed: boolean;
			OrmPOItemSppbIns: GG[];
		};
		type II = Pick<TCustomerPO, "id" | "nomor_po"> & {
			isClosed: boolean;
			OrmCustomerSPPBIns: KJD[];
		};

		return checkCredentialV2(ctx, async (): Promise<II[]> => {
			const listPo = await OrmCustomerPO.findAll({
				where: {id_customer: input.id},
				attributes: ["id", "nomor_po"] as KeyOf<TCustomerPO>,
				include: [
					{
						model: OrmCustomerSPPBIn,
						attributes: ["id", "nomor_surat"] as KeyOf<TCustomerSPPBIn>,
						include: [
							{
								model: OrmPOItemSppbIn,
								attributes: {
									exclude: [
										...defaultExcludeColumn,
										"lot_no",
									] as KeyOf<TPOItemSppbIn>,
								},
								include: [
									{
										model: OrmKanbanItem,
										attributes: {
											exclude: [
												...defaultExcludeColumn,
												"master_item_id",
												"id_item_po",
												"id_kanban",
											] as KeyOf<TKanbanItem>,
										},
									},
									{
										model: OrmMasterItem,
										attributes: ["id", "name"] as (keyof TMasterItem)[],
									},
								],
							},
						],
					},
				],
			});

			const result = listPo.map(async ({dataValues}) => {
				const listSppbIn = await OrmCustomerSPPBIn.findAll({
					logging: true,
					where: {id_po: dataValues.id},
					attributes: ["id", "nomor_surat"] as KeyOf<TCustomerSPPBIn>,
					include: [
						{
							model: OrmPOItemSppbIn,
							attributes: {
								exclude: [
									...defaultExcludeColumn,
									"lot_no",
								] as KeyOf<TPOItemSppbIn>,
							},
							include: [
								{
									model: OrmKanbanItem,
									attributes: {
										exclude: [
											...defaultExcludeColumn,
											"master_item_id",
											"id_item_po",
											"id_kanban",
										] as KeyOf<TKanbanItem>,
									},
								},
								{
									model: OrmMasterItem,
									attributes: ["id", "name"] as (keyof TMasterItem)[],
								},
							],
						},
					],
				});

				const dataSppbIn =
					listSppbIn.length > 0
						? listSppbIn.map(({dataValues: sppbIn}) => {
								// @ts-ignore
								const val = sppbIn as KJD;
								const dataSppbInItem = val.OrmPOItemSppbIns.map(
									// @ts-ignore
									({dataValues: sppbInItem}: Model<GG>) => {
										const qtys = sppbInItem.OrmKanbanItems?.reduce?.(
											(ret, item) => {
												if (item?.id_item === sppbInItem.id) {
													qtyMap(({qtyKey}) => {
														if (!ret[qtyKey]) ret[qtyKey] = 0;
														ret[qtyKey] += item?.[qtyKey]!;
													});
												}
												return ret;
											},
											{} as Record<UQtyList, number>,
										);

										const compare = qtyMap(({qtyKey}) => {
											return qtys?.[qtyKey] == (sppbInItem?.[qtyKey] ?? 0);
										});

										return {...sppbInItem, isClosed: !compare.includes(false)};
									},
								);

								return {
									...val,
									OrmPOItemSppbIns: dataSppbInItem,
									isClosed: !dataSppbInItem
										.map(e => e.isClosed)
										.includes(false),
								};
						  })
						: [];

				return {
					...dataValues,
					OrmCustomerSPPBIns: dataSppbIn,
					isClosed: !dataSppbIn.map(e => e.isClosed).includes(false),
				};
			});

			return Promise.all(result);
		});
	}),
});

export default kanbanPoRouters;

import {Model} from "sequelize";

import {TMasterItem, UQtyList} from "@appTypes/app.type";
import {
	TCustomerPO,
	TCustomerSPPBIn,
	TKanbanItem,
	TPOItemSppbIn,
	zId,
} from "@appTypes/app.zod";
import {
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
	get: procedure.input(zId).query(({ctx, input}) => {
		type GG = TPOItemSppbIn & {
			isClosed: boolean;
			OrmMasterItem: Pick<TMasterItem, "id" | "name">;
			OrmKanbanItems: TKanbanItem[];
		};
		type KJD = Pick<TCustomerSPPBIn, "id" | "nomor_surat"> & {
			isClosed: boolean;
			OrmPOItemSppbIns: GG[];
		};
		type II = TCustomerPO & {
			isClosed: boolean;
			OrmCustomerSPPBIns: KJD[];
		};

		return checkCredentialV2(ctx, async (): Promise<II[]> => {
			const listPo = await OrmCustomerPO.findAll({
				where: {id_customer: input.id},
				include: [
					{
						model: OrmCustomerSPPBIn,
						attributes: ["id", "nomor_surat"] as (keyof TCustomerSPPBIn)[],
						include: [
							{
								separate: true,
								model: OrmPOItemSppbIn,
								include: [
									{model: OrmKanbanItem, separate: true},
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

			const result = listPo.map(({dataValues}) => {
				const val = dataValues as II;

				const dataSppbIn = val.OrmCustomerSPPBIns.map(
					// @ts-ignore
					({dataValues: sppbIn}: Model<KJD>) => {
						const dataSppbInItem = sppbIn.OrmPOItemSppbIns.map(
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
							...sppbIn,
							OrmPOItemSppbIns: dataSppbInItem,
							isClosed: !dataSppbInItem.map(e => e.isClosed).includes(false),
						};
					},
				);

				return {
					...val,
					OrmCustomerSPPBIns: dataSppbIn,
					isClosed: !dataSppbIn.map(e => e.isClosed).includes(false),
				};
			});

			return result;
		});
	}),
});

export default kanbanPoRouters;

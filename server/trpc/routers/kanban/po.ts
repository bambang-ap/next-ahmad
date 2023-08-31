import {Model} from "sequelize";

import {TKanban, TMasterItem, UQtyList} from "@appTypes/app.type";
import {
	TCustomerPO,
	TCustomerSPPBIn,
	TKanbanItem,
	TPOItemSppbIn,
	ZId,
	zId,
} from "@appTypes/app.zod";
import {
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";
import {qtyMap} from "@utils";

const kanbanPoRouters = router({
	getNew: procedure.input(zId).query(({ctx, input}) => {
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
								model: OrmPOItemSppbIn,
								include: [
									OrmKanbanItem,
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
	get: procedure.input(zId).query(({ctx, input}) => {
		type GG = TPOItemSppbIn & {OrmMasterItem: TMasterItem};
		type KJD = TCustomerSPPBIn & {
			isClosed: boolean;
			OrmKanbans?: ZId[];
			OrmPOItemSppbIns: GG[];
		};
		type II = TCustomerPO & {
			isClosed: boolean;
			OrmCustomerSPPBIns: KJD[];
			OrmKanbans: (TKanban & {
				OrmKanbanItems: TKanbanItem[];
			})[];
		};
		return checkCredentialV2(ctx, async (): Promise<II[]> => {
			const listPo = await OrmCustomerPO.findAll({
				where: {id_customer: input.id},
				include: [
					{
						model: OrmCustomerSPPBIn,
						include: [
							{model: OrmKanban, attributes: ["id"]},
							{
								model: OrmPOItemSppbIn,
								include: [OrmMasterItem],
							},
						],
					},
					{
						model: OrmKanban,
						include: [{model: OrmKanbanItem}],
					},
				],
			});
			const result = listPo.map(e => {
				const {OrmCustomerSPPBIns, ...val} = e.dataValues as II;
				let isClosed = false;
				if (OrmCustomerSPPBIns.length > 0) {
					if (val.OrmKanbans.length > 0) {
						let sppbInItem: undefined | TPOItemSppbIn;
						const qtys = val.OrmKanbans.reduce((ret, kanban) => {
							const item = kanban.OrmKanbanItems?.[0];
							sppbInItem = OrmCustomerSPPBIns.find(
								e => e.id === kanban.id_sppb_in,
							)?.OrmPOItemSppbIns.find(u => u.id === item?.id_item);

							qtyMap(({qtyKey}) => {
								if (!ret[qtyKey]) ret[qtyKey] = 0;
								ret[qtyKey] += item?.[qtyKey]!;
							});
							return ret;
						}, {} as Record<UQtyList, number>);

						const compare = qtyMap(({qtyKey}) => {
							return qtys[qtyKey] === sppbInItem?.[qtyKey]!;
						});

						if (!compare.includes(false)) isClosed = true;
					}
				} else isClosed = true;

				// @ts-ignore
				const sppbInData = OrmCustomerSPPBIns.map((eVal: Model<KJD>) => {
					return {
						...eVal.dataValues,
						isClosed: eVal.dataValues.OrmKanbans?.length! === 0 ?? false,
					};
				});

				return {...val, OrmCustomerSPPBIns, isClosed};
			});

			return Promise.all(result);
		});
	}),
});

export default kanbanPoRouters;

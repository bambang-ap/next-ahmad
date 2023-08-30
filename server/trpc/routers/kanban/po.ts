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
	get: procedure.input(zId).query(({ctx, input}) => {
		type KJD = TCustomerSPPBIn & {
			isClosed: boolean;
			OrmKanbans?: ZId[];
			OrmPOItemSppbIns: (TPOItemSppbIn & {OrmMasterItem: TMasterItem})[];
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
				logging: true,
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

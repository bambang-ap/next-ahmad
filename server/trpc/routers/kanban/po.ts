import {Model} from 'sequelize';

import {
	TMasterItem,
	TPOItem,
	UnitUnit,
	UQtyList,
	ZId,
} from '@appTypes/app.type';
import {
	TCustomerPO,
	TCustomerSPPBIn,
	TKanbanItem,
	TPOItemSppbIn,
	zId,
} from '@appTypes/app.zod';
import {defaultExcludeColumn} from '@constants';
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {qtyMap} from '@utils';

export type GG = TPOItemSppbIn & {
	isClosed: boolean;
	OrmMasterItem: Pick<TMasterItem, 'id' | 'name' | 'keterangan'>;
	OrmKanbanItems: TKanbanItem[];
	OrmCustomerPOItem: Pick<TPOItem, keyof UnitUnit | keyof ZId>;
};
export type KJD = Pick<TCustomerSPPBIn, 'id' | 'nomor_surat'> & {
	isClosed: boolean;
	OrmPOItemSppbIns: GG[];
};
export type II = Pick<TCustomerPO, 'id' | 'nomor_po'> & {
	isClosed: boolean;
	OrmCustomerSPPBIns: KJD[];
};

const kanbanPoRouters = router({
	get_customer: procedure.query(({ctx}) => {
		return checkCredentialV2(ctx, async () => {
			const data = await OrmCustomer.findAll({
				attributes: ['id', 'name', 'keterangan'] as KeyOf<TCustomerPO>,
			});
			return data.map(e => e.dataValues);
		});
	}),
	get: procedure.input(zId).query(async ({ctx, input}) => {
		return checkCredentialV2(ctx, async (): Promise<II[]> => {
			const listPo = await OrmCustomerPO.findAll({
				where: {id_customer: input.id},
				attributes: ['id', 'nomor_po'] as KeyOf<TCustomerPO>,
			});

			const result = listPo.map(async ({dataValues}) => {
				const listSppbIn = await OrmCustomerSPPBIn.findAll({
					where: {id_po: dataValues.id},
					attributes: ['id', 'nomor_surat'] as KeyOf<TCustomerSPPBIn>,
					include: [
						{
							separate: true,
							model: OrmPOItemSppbIn,
							attributes: {
								exclude: [...defaultExcludeColumn] as KeyOf<TPOItemSppbIn>,
							},
							include: [
								{
									model: OrmCustomerPOItem,
									attributes: ['id', 'unit1', 'unit2', 'unit3'] as KeyOf<
										GG['OrmCustomerPOItem']
									>,
								},
								{
									separate: true,
									model: OrmKanbanItem,
									attributes: {
										exclude: [
											...defaultExcludeColumn,
											'master_item_id',
											'id_item_po',
											'id_kanban',
										] as KeyOf<TKanbanItem>,
									},
								},
								{
									model: OrmMasterItem,
									attributes: [
										'id',
										'name',
										'keterangan',
									] as (keyof TMasterItem)[],
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

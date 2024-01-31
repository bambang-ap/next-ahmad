import {Op, Transaction} from 'sequelize';
import {z} from 'zod';

import {
	tScanItemReject,
	tScanNew,
	tScanNewItem,
	TScanTarget,
	UnitQty,
	zId,
} from '@appTypes/app.zod';
import {Success} from '@constants';
import {
	attrParserV2,
	dInItem,
	dKnbItem,
	dOutItem,
	dRejItem,
	dScan,
	dScanItem,
	ORM,
	OrmKanbanItem,
	wherePagesV4,
} from '@database';
import {REJECT_REASON} from '@enum';
import {checkCredentialV2, generateId} from '@server';
import {procedure} from '@trpc';
import {TRPCError} from '@trpc/server';
import {atLeastOneDefined, qtyMap, qtyReduce} from '@utils';

export function updateScan() {
	async function checkingNext(id_kanban: string, status: TScanTarget) {
		type Ret = typeof scn.obj & {
			dScanItems: (typeof scnItem.obj & {
				dKnbItem: typeof knbItem.obj & {
					dInItem: typeof inItem.obj & {dOutItems: typeof outItem.obj[]};
				};
			})[];
		};

		const outItem = attrParserV2(dOutItem, ['id']);
		const inItem = attrParserV2(dInItem, ['id']);
		const knbItem = attrParserV2(dKnbItem, ['id']);
		const scn = attrParserV2(dScan, ['id_kanban', 'status']);
		const scnItem = attrParserV2(dScanItem, ['id']);

		const isProd = status === 'produksi';
		const isFg = status === 'finish_good';

		if (isFg) {
			const nextSppbOut = await scn.model.findAll({
				attributes: scn.attributes,
				where: wherePagesV4<Ret>({
					status,
					id_kanban,
					'$dScanItems.dKnbItem.dInItem.dOutItems.id$': {[Op.not]: null},
				}),
				include: [
					{
						...scnItem,
						include: [{...knbItem, include: [{...inItem, include: [outItem]}]}],
					},
				],
			});

			if (nextSppbOut.length > 0) throw new TRPCError({code: 'FORBIDDEN'});
		} else {
			const nextScan = await dScan.findOne({
				where: {id_kanban, status: isProd ? 'qc' : 'finish_good'},
			});

			if (!!nextScan)
				throw new TRPCError({
					code: 'FORBIDDEN',
					message:
						'Tidak bisa mengubah data, silahkan cek dan hapus data pada step selanjutnya.',
				});
		}
	}

	return {
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

				async function updateOT(
					transaction: Transaction,
					id_item: string,
					outStandingQty?: UnitQty,
				) {
					const kanbanItem = await OrmKanbanItem.findOne({
						where: {id: id_item},
					});

					if (!!kanbanItem) {
						const kanbanItemQty = qtyReduce((ret, {qtyKey}) => {
							const aa = outStandingQty?.[qtyKey];
							const bb = kanbanItem.dataValues?.[qtyKey];
							const curQty = parseFloat(aa?.toString() ?? '0');
							const prevQty = parseFloat(bb?.toString() ?? '0');

							return {
								...ret,
								[qtyKey]: !!prevQty ? prevQty - curQty : aa,
							};
						});

						await OrmKanbanItem.update(
							{...kanbanItem.dataValues, ...kanbanItemQty},
							{where: {id: id_item}, transaction},
						);
					}
				}

				return checkCredentialV2(ctx, async () => {
					const transaction = await ORM.transaction();

					try {
						await checkingNext(id_kanban, status);

						const existingScan = await dScan.findOne({
							where: {id_kanban, status},
						});

						const [{dataValues: updatedScan}] = await dScan.upsert(
							{
								...scanData,
								status,
								id_kanban,
								id: existingScan?.dataValues.id ?? generateId('SN_'),
							},
							{transaction},
						);

						for (const [id_item, item] of Object.entries(items)) {
							const qtys = qtyReduce((ret, {qtyKey}) => {
								return {...ret, [qtyKey]: item[qtyKey]};
							});

							const existingItem = await dScanItem.findOne({
								where: {id_kanban_item: id_item, id_scan: updatedScan.id},
							});
							const [{dataValues}] = await dScanItem.upsert(
								{
									...qtys,
									id_scan: updatedScan.id,
									id_kanban_item: id_item,
									item_from_kanban: item.item_from_kanban,
									id: existingItem?.dataValues.id ?? generateId('SNI_'),
								},
								{transaction},
							);

							let outStandingQty = qtyReduce((ret, {qtyKey}) => {
								const curQty = parseFloat(item?.[qtyKey]?.toString() ?? '0');
								const prevQty = parseFloat(
									prevItems?.[id_item]?.[qtyKey]?.toString() ?? '0',
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
										{transaction, where: {id: updatedScan.id}},
									);

									await dRejItem.create(
										{
											...rejectItems?.[id_item]!,
											id: generateId('SIR_'),
											id_item: dataValues.id,
											reason,
										},
										{transaction},
									);

									if (reason === REJECT_REASON.RP) {
										const qtyOT = rejectItems?.[id_item]!;
										qtyMap(({qtyKey}) => {
											const a = outStandingQty[qtyKey]!;
											const b = parseFloat(qtyOT[qtyKey]?.toString() ?? '0');
											outStandingQty[qtyKey] = a - b;
										});
										await updateOT(transaction, id_item, qtyOT);
									}
								}
							}

							const hasOT =
								Object.values(outStandingQty).filter(
									qty => parseFloat(qty?.toString() ?? '0') > 0,
								).length > 0;

							if (hasOT) await updateOT(transaction, id_item, outStandingQty);
						}

						await transaction.commit();
						return Success;
					} catch (err) {
						await transaction.rollback();
						if (err instanceof TRPCError) throw new TRPCError(err);
						throw new TRPCError({code: 'BAD_REQUEST'});
					}
				});
			}),

		remove: procedure
			.input(zId.and(tScanNew.pick({status: true})))
			.mutation(({ctx, input}) => {
				const {id: id_kanban, status} = input;
				return checkCredentialV2(ctx, async () => {
					const transaction = await ORM.transaction();

					try {
						await checkingNext(id_kanban, status);

						const targetScan = await dScan.findOne({
							transaction,
							where: {id_kanban, status},
						});
						const targetScanData = targetScan?.toJSON();

						if (!!targetScanData) {
							const {id} = targetScanData;

							const id_item = (
								await dScanItem.findAll({transaction, where: {id_scan: id}})
							).map(e => e.toJSON().id);

							await dRejItem.destroy({transaction, where: {id_item}});
							await dScanItem.destroy({transaction, where: {id_scan: id}});
							await dScan.destroy({transaction, where: {id}});
						}

						await transaction.commit();
						return Success;
					} catch (err) {
						await transaction.rollback();
						if (err instanceof TRPCError) throw new TRPCError(err);
						// @ts-ignore
						throw new TRPCError({...err, code: 'BAD_REQUEST'});
					}
				});
			}),
	};
}

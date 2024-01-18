import {
	KanbanGetRow,
	PagingResult,
	TCustomerSPPBOutUpsert,
	TKanbanUpsertItem,
	TScanTarget,
} from '@appTypes/app.type';
import {
	tableFormValue,
	tCustomerSPPBOutUpsert,
	TScan,
	zId,
} from '@appTypes/app.zod';
import {Success} from '@constants';
import {
	dOutItem,
	dSjOut,
	dSppbBridge,
	getPOSppbOutAttributes,
	indexWhereAttributes,
	orderPages,
	ORM,
	OrmCustomerSPPBOut,
	OrmCustomerSPPBOutItem,
	OrmScan,
	sppbOutGetAttributes,
	wherePagesV2,
	wherePagesV3,
} from '@database';
import {IndexNumber} from '@enum';
import {
	checkCredentialV2,
	generateId,
	genNumberIndexUpsert,
	pagingResult,
} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

import {Op} from 'sequelize';
import {z} from 'zod';

import {appRouter} from '..';

type GetPage = PagingResult<TCustomerSPPBOutUpsert>;
export type GetFGRet = TScan & {
	kanban: Omit<KanbanGetRow, 'items'> & {
		items: MyObject<TKanbanUpsertItem & {lot_no_imi?: string}>;
	};
};

const sppbOutRouters = router({
	getPO: procedure.input(zId).query(({ctx, input}) => {
		type RetOutput = typeof Ret;
		const {id: id_customer} = input;

		const {po, sjInInclude, Ret} = getPOSppbOutAttributes();

		return checkCredentialV2(ctx, async () => {
			const wherer = wherePagesV3<RetOutput>({
				'$dSJIns.dKanbans.dScans.status$': 'finish_good' as TScanTarget,
			});

			const order = orderPages<RetOutput>({
				'dSJIns.dInItems.dItem.kode_item': true,
			});

			const dataPO = await po.model.findAll({
				logging: true,
				order,
				include: [sjInInclude],
				attributes: po.attributes,
				where: {id_customer, ...wherer},
			});

			return dataPO.map(e => e.toJSON() as unknown as RetOutput);
		});
	}),

	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		type RetType = typeof Ret;

		const {limit, page, search} = input;
		const {outItem, sjOut, tIndex, inItem, sjIn, cust, vehicle, Ret} =
			sppbOutGetAttributes();

		function remapData(data: RetType): TCustomerSPPBOutUpsert {
			let po: TCustomerSPPBOutUpsert['po'] = [];

			const {dOutItems, ...rest} = data;

			for (const {dInItem: sppbinItem, id_item, ...cur} of dOutItems) {
				const id_po = sppbinItem.dSJIn.id_po;
				const id_sppb_in = sppbinItem.id_sppb_in;

				const isPoExist = po.findIndex(itm => itm.id_po === id_po) >= 0;

				if (!isPoExist) po.push({id_po, sppb_in: []});

				const iPo = po.findIndex(itm => itm.id_po === id_po);
				const isInExist =
					po?.[iPo]?.sppb_in.findIndex(itm => itm.id_sppb_in === id_sppb_in)! >=
					0;

				if (!isInExist) po[iPo]?.sppb_in.push({id_sppb_in, items: {}});

				const iSjIn = po?.[iPo]?.sppb_in.findIndex(
					itm => itm.id_sppb_in === id_sppb_in,
				)!;

				po[iPo]!.sppb_in[iSjIn]!.items[id_item] = {
					...cur,
					id_item_po: sppbinItem.id_item,
					master_item_id: sppbinItem.master_item_id,
				};
			}

			return {...rest, po};
		}

		return checkCredentialV2(ctx, async (): Promise<GetPage> => {
			const whereIndex = indexWhereAttributes<RetType>(
				'dIndex.prefix',
				'index_number',
				search,
			);
			const {count, rows: data} = await sjOut.model.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
				attributes: {include: [whereIndex.attributes]},
				where: !!search
					? {
							[Op.or]: [
								whereIndex.where,
								wherePagesV2<RetType>(
									[
										'invoice_no',
										'keterangan',
										'$dCust.name$',
										'$dVehicle.name$',
									],
									search,
								),
							],
					  }
					: undefined,
				include: [
					tIndex,
					vehicle,
					cust,
					{...outItem, separate: true, include: [{...inItem, include: [sjIn]}]},
				],
			});

			const allDataSppbIn = data.map<TCustomerSPPBOutUpsert>(e => {
				const val = e.toJSON() as unknown as RetType;

				return remapData(val);
			});

			return pagingResult(count, page, limit, allDataSppbIn);
		});
	}),

	getFg: procedure
		.input(z.string().optional())
		.query(({input, ctx: {req, res}}): Promise<GetFGRet[]> => {
			const routerCaller = appRouter.createCaller({req, res});

			return checkCredentialV2({req, res}, async () => {
				const dataScan = await OrmScan.findAll({
					where: {status_finish_good: true, id_customer: input},
					attributes: {
						exclude: [
							'item_produksi',
							'item_qc',
							'status_produksi',
							'status_qc',
						] as (keyof TScan)[],
					},
				});

				const dataScanPromise = dataScan.map(async ({dataValues}) => {
					const [kanban] = await routerCaller.kanban.get({
						type: 'kanban',
						where: {id: dataValues.id_kanban},
					});

					return {...dataValues, kanban: {...kanban!}};
				});

				const promisedData = await Promise.all(dataScanPromise);

				return promisedData.reduce((ret, cur) => {
					const index = ret.findIndex(
						e => e.kanban.id_sppb_in === cur.kanban.id_sppb_in,
					);

					if (index < 0) ret.push(calllasl(cur, cur));
					else ret[index] = calllasl(ret[index]!, cur);

					return ret;
				}, [] as GetFGRet[]);

				function calllasl(asd: GetFGRet, cur: GetFGRet): GetFGRet {
					const nextItemsMap = new Map(
						Object.entries(cur.kanban.items).map(([a, b]) => {
							return [a, {...b, lot_no_imi: cur.lot_no_imi}];
						}),
					);
					const prevItems = asd?.kanban.items;
					const nextItems = Object.fromEntries(nextItemsMap);
					const prevListMesin = asd?.kanban.list_mesin;
					const nextListMesin = cur.kanban.list_mesin;
					return {
						...asd,
						...cur,
						kanban: {
							...cur.kanban,
							items: {...prevItems, ...nextItems},
							list_mesin: {...prevListMesin, ...nextListMesin},
						},
					};
				}
			});
		}),

	upsert: procedure
		.input(tCustomerSPPBOutUpsert.partial({id: true}))
		.mutation(({ctx: {req, res}, input}) => {
			return checkCredentialV2({req, res}, async () => {
				const transaction = await ORM.transaction();

				try {
					const {po, id = generateId('SPPBO_'), ...rest} = input;
					const body = await genNumberIndexUpsert(
						OrmCustomerSPPBOut,
						IndexNumber.OutSJ,
						{...rest, id},
					);

					const [dataSppbOut] = await OrmCustomerSPPBOut.upsert(body);

					for (const cur of po) {
						for (const bin of cur.sppb_in) {
							const bridgeWhere = {
								in_id: bin.id_sppb_in,
								out_id: dataSppbOut.dataValues.id,
							};
							const isExist = await dSppbBridge.findOne({
								where: bridgeWhere,
							});

							await dSppbBridge.upsert({
								...bridgeWhere,
								id: isExist?.dataValues.id ?? generateId('SJB-'),
							});

							const binItems = entries(bin.items);

							const removedItemsId = binItems.reduce<string[]>((ret, [, e]) => {
								if (e.exclude) ret.push(e.id!);
								return ret;
							}, []);

							await OrmCustomerSPPBOutItem.destroy({
								transaction,
								where: {id: removedItemsId},
							});

							for (const [id_item, item] of binItems) {
								if (!item.exclude) {
									await OrmCustomerSPPBOutItem.upsert({
										id_item,
										qty1: item.qty1,
										qty2: item.qty2,
										qty3: item.qty3,
										id: item.id ?? generateId('SJOI-'),
										id_sppb_out: dataSppbOut.dataValues.id,
									});
								}
							}
						}
					}

					await transaction.commit();
					return Success;
				} catch (err) {
					await transaction.rollback();
					throw new TRPCError({code: 'BAD_REQUEST'});
				}
			});
		}),
	delete: procedure.input(zId).mutation(({ctx: {req, res}, input}) => {
		return checkCredentialV2({req, res}, async () => {
			const transaction = await ORM.transaction();

			try {
				await dSppbBridge.destroy({transaction, where: {out_id: input.id}});
				await dSjOut.destroy({transaction, where: input});
				await dOutItem.destroy({transaction, where: {id_sppb_out: input.id}});

				await transaction.commit();
				return Success;
			} catch (err) {
				await transaction.rollback();
				throw new TRPCError({code: 'BAD_REQUEST'});
			}
		});
	}),
});

export default sppbOutRouters;

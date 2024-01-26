import {Op} from 'sequelize';

import {PagingResult, TDataScan, TScan} from '@appTypes/app.type';
import {
	tableFormValue,
	tRoute,
	tScan,
	TScanDate,
	tScanItem,
	tScanNew,
	TScanTarget,
	tScanTarget,
	UnitQty,
	zId,
} from '@appTypes/app.zod';
import {isProd, Success} from '@constants';
import {
	dScan,
	getScanAttributes,
	getScanAttributesV2,
	indexWhereAttributes,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScan,
	OrmScanOrder as scanOrder,
	OrmUser,
	scanListAttributes,
	wherePagesV2,
} from '@database';
import {CATEGORY_REJECT_DB} from '@enum';
import {checkCredentialV2, pagingResult} from '@server';
import {procedure, router} from '@trpc';
import {appRouter} from '@trpc/routers';
import {TRPCError} from '@trpc/server';
import {moment, qtyMap} from '@utils';

import {getScan} from './get';
import {updateScan} from './update';

export type ScanList = ReturnType<typeof scanListAttributes>['Ret'];
export type ScanGet = ReturnType<typeof getScanAttributes>['Ret'];
export type ScanGetV2 = ReturnType<typeof getScanAttributesV2>['Ret'];

type ListResult = PagingResult<ScanList>;

function enabled(target: TScanTarget, dataScan?: TScan) {
	switch (target) {
		case 'produksi':
			return true;
		case 'qc':
			return dataScan?.status_produksi;
		case 'finish_good':
			return dataScan?.status_qc;
		// case 'out_barang':
		// 	return dataScan?.status_finish_good;
		default:
			return false;
	}
}

const scanRouters = router({
	...updateScan(),
	...getScan(),
	editNotes: procedure
		.input(tScanNew.pick({id: true, status: true, notes: true}).partial())
		.mutation(({ctx, input: {id, notes, status}}) => {
			return checkCredentialV2(ctx, async () => {
				await dScan.update({notes}, {where: {id_kanban: id, status}});

				return Success;
			});
		}),
	list: procedure
		.input(tableFormValue.extend({target: tScanTarget}))
		.query(({ctx, input}) => {
			const {limit, page, search, target} = input;

			const {scan, kanban, tIndex, sjIn, po, cust, num, Ret} =
				scanListAttributes();

			return checkCredentialV2(ctx, async (): Promise<ListResult> => {
				const where1 = isProd ? {} : {id_kanban: search};
				const where2 = wherePagesV2<ScanList>(
					[
						'$dKanban.keterangan$',
						'$dKanban.nomor_kanban$',
						'$dKanban.dPo.nomor_po$',
						'$dKanban.dSJIn.nomor_surat$',
						'$dKanban.dPo.dCust.name$',
					],
					search,
				);

				const {where: where3, attributes} = indexWhereAttributes<ScanList>(
					'dKanban.dIndex.prefix',
					'dKanban.index_number',
					search,
				);

				const {count, rows: data} = await scan.model.findAndCountAll({
					limit,
					attributes: [num, attributes, ...(scan.attributes ?? [])],
					order: scanOrder(),
					offset: (page - 1) * limit,
					where: {
						status: target,
						...(search ? {[Op.or]: [where1, where2, where3]} : {}),
					},
					include: [
						{...kanban, include: [tIndex, sjIn, {...po, include: [cust]}]},
					],
				});

				const allDataScan = data.map(e => e.toJSON() as unknown as typeof Ret);

				return pagingResult(count, page, limit, allDataScan);
			});
		}),
	getV2: procedure.input(zId.extend(tRoute.shape)).query(({ctx, input}) => {
		const {id: id_kanban, route} = input;

		const {A, B, C, D, E, F, G, H, I, J, Ret} = getScanAttributes(route);

		return checkCredentialV2(ctx, async () => {
			const data = await OrmScan.findOne({
				where: {id_kanban},
				attributes: A.keys,
				include: [
					{
						model: OrmKanban,
						attributes: B.keys,
						include: [
							{
								model: OrmUser,
								as: OrmKanban._aliasCreatedBy,
								attributes: C.keys,
							},
							{
								model: OrmCustomerSPPBIn,
								attributes: F.keys,
								include: [
									{
										model: OrmCustomerPO,
										attributes: D.keys,
										include: [{model: OrmCustomer, attributes: E.keys}],
									},
								],
							},
							{
								separate: true,
								attributes: G.keys,
								model: OrmKanbanItem,
								include: [
									{model: OrmMasterItem, attributes: J.keys},
									{
										model: OrmPOItemSppbIn,
										attributes: H.keys,
										include: [{model: OrmCustomerPOItem, attributes: I.keys}],
									},
								],
							},
						],
					},
				],
			});

			// @ts-ignore
			return data?.dataValues as typeof Ret;
		});
	}),

	get: procedure
		.input(zId.extend({target: tScanTarget}))
		.query(async ({input: {id, target}, ctx: {req, res}}) => {
			return checkCredentialV2(
				{req, res},
				async (): Promise<TDataScan | null> => {
					const routerCaller = appRouter.createCaller({req, res});
					const dataKanban = await routerCaller.kanban.get({
						type: 'kanban',
						where: {id},
					});

					const dataScan = await OrmScan.findOne({
						where: {id_kanban: id},
					});

					if (dataScan) {
						const dataScann = {...dataScan?.dataValues, dataKanban};
						// @ts-ignore
						if (!enabled(target, dataScann))
							throw new TRPCError({
								code: 'NOT_FOUND',
								message: 'Data tidak ditemukan',
							});

						// @ts-ignore
						return dataScann;
					}

					return null;
				},
			);
		}),
	update: procedure
		.input(
			tScanItem.extend({
				target: tScanTarget,
				...tScan.pick({id: true, lot_no_imi: true}).shape,
			}),
		)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(
				{req, res},
				async (): Promise<{message: string}> => {
					const {id, target, ...rest} = input;
					const statusTarget = `status_${target}` as const;
					const itemTarget = `item_${target}` as const;

					// const dataScan = await routerCaller.scan.get({id, target});
					const dataScan = await OrmScan.findOne({where: {id_kanban: id}});

					if (!dataScan) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Failed to get dataScan',
						});
					}

					if (!enabled(target, dataScan?.dataValues!)) {
						throw new TRPCError({code: 'BAD_REQUEST', message: 'Failed'});
					}

					const date: TScanDate = {
						...dataScan?.dataValues.date,
						[`${target}_updatedAt`]: moment(),
					};

					await OrmScan.update(
						{[statusTarget]: false, date, ...rest},
						{where: {id: dataScan.dataValues.id}},
					);

					switch (target) {
						case 'qc':
							const i = 0;
							const {item_qc, item_qc_reject, item_qc_reject_category} = rest;
							let updateFg = false;
							let toKanban = {} as UnitQty;
							qtyMap(({num, qtyKey}): any => {
								const qty = item_qc_reject?.[i]?.[num]! as number;
								const reason = item_qc_reject_category?.[i]?.[num]!;
								switch (reason) {
									case CATEGORY_REJECT_DB.A:
									case CATEGORY_REJECT_DB.C:
									case CATEGORY_REJECT_DB.B:
										if (qty > 0) {
											if (reason === CATEGORY_REJECT_DB.B)
												return (toKanban[qtyKey] = qty);
											else return (updateFg = true);
										}
										break;
									default:
										break;
								}
							});

							const p = [
								Object.keys(toKanban).length > 0 &&
									OrmKanbanItem.update(toKanban, {
										where: {id: item_qc![i]![0]},
									}),
								updateFg &&
									OrmScan.update(
										{
											status_finish_good: true,
											item_finish_good: item_qc,
										},
										{where: {id: dataScan.dataValues.id}},
									),
							];

							await Promise.all(p);
							break;

						default:
							const promisedUpdateItem = rest[itemTarget]?.map(
								async ([idItem, ...qtys]) => {
									const f = qtyMap(({qtyKey}, index) => {
										if (!qtys[index]) return;
										return {[qtyKey]: qtys[index]};
									});
									const updatedQty = f.reduce(
										(a, b) => ({...a, ...b}),
										{} as UnitQty,
									);
									return OrmKanbanItem.update(updatedQty, {
										where: {id: idItem},
									});
								},
							);
							await Promise.all(promisedUpdateItem ?? []);
							break;
					}

					return Success;
				},
			);
		}),
});

export default scanRouters;

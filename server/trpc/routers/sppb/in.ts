import {z} from 'zod';

import {
	PagingResult,
	TCustomerPO,
	TMasterItem,
	TPOItem,
	TPOItemSppbIn,
	UnitQty,
} from '@appTypes/app.type';
import {
	tableFormValue,
	tCustomerPO,
	tCustomerSPPBIn,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
	tUpsertSppbIn,
	zId,
} from '@appTypes/app.zod';
import {defaultLimit, Success} from '@constants';
import {
	attrParser,
	orderPages,
	ORM,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmMasterItem,
	OrmPOItemSppbIn,
	sppbInGetPage,
	wherePagesV2,
} from '@database';
import {getKanbanGrade} from '@db/getGrade';
import {
	checkCredentialV2,
	generateId,
	pagingResult,
	procedureError,
} from '@server';
import {procedure, router} from '@trpc';

import {appRouter} from '..';

import {TRPCError} from '@trpc/server';
import {averageGrade, qtyMap, qtyReduce} from '@utils';

import {GetPageRows} from '../customer_po';

type GetPage = PagingResult<SppbInRows>;
export type SppbInRows = ReturnType<typeof sppbInGetPage>['Ret'];

const sppbInRouters = router({
	po: router({
		gett: procedure
			.input(tCustomerPO.pick({id_customer: true}))
			.query(({ctx, input}) => {
				const A = attrParser(tCustomerPO, ['id', 'nomor_po']);
				const B = attrParser(tPOItem, [
					'harga',
					'createdAt',
					'id',
					'master_item_id',
					'qty1',
					'qty2',
					'qty3',
					'unit1',
					'unit2',
					'unit3',
					'discount',
					'discount_type',
				]);
				const C = attrParser(tMasterItem, ['name', 'kode_item']);
				const D = attrParser(tPOItemSppbIn, ['qty1', 'qty2', 'qty3']);

				type Ret = typeof A.obj & {
					isClosed?: boolean;
					OrmCustomerPOItems: (typeof B.obj & {
						totalQty: UnitQty;
						isClosed?: boolean;
						OrmMasterItem: typeof C.obj;
						OrmPOItemSppbIns: typeof D.obj[];
					})[];
				};

				return checkCredentialV2(ctx, async (): Promise<Ret[]> => {
					const dataPO = await OrmCustomerPO.findAll({
						attributes: A.keys,
						where: input,
						order: orderPages<Ret>({'OrmCustomerPOItems.createdAt': true}),
						include: [
							{
								attributes: B.keys,
								model: OrmCustomerPOItem,
								include: [
									{attributes: C.keys, model: OrmMasterItem},
									{attributes: D.keys, model: OrmPOItemSppbIn},
								],
							},
						],
					});

					return dataPO.map(e => {
						// @ts-ignore
						const val = e.dataValues as Ret;

						const u = val.OrmCustomerPOItems.map(d => {
							// @ts-ignore
							const vall = d.dataValues as typeof d;

							const totalQty = qtyReduce((r, {qtyKey}) => {
								let qty: number = r[qtyKey]!;
								vall.OrmPOItemSppbIns.forEach(itm => {
									qty += parseFloat(itm[qtyKey]!?.toString() ?? '0');
								});
								return {...r, [qtyKey]: qty};
							});

							const compare = qtyMap(({qtyKey}) => {
								if (!vall[qtyKey]) return true;
								return vall[qtyKey] == totalQty[qtyKey];
							});

							return {...vall, totalQty, isClosed: !compare.includes(false)};
						});

						return {
							...val,
							OrmCustomerPOItems: u,
							isClosed: !u.map(v => v.isClosed).includes(false),
						};
					});
				});
			}),

		get: procedure.query(({ctx}) => {
			type II = TCustomerPO & {
				OrmCustomerPOItems: (TPOItem & {
					OrmMasterItem: TMasterItem;
					OrmPOItemSppbIns: TPOItemSppbIn[];
				})[];
			};
			return checkCredentialV2(ctx, async (): Promise<GetPageRows[]> => {
				const routerCaller = appRouter.createCaller(ctx);
				const listPo = await OrmCustomerPO.findAll({
					include: [
						{
							model: OrmCustomerPOItem,
							include: [OrmMasterItem, OrmPOItemSppbIn],
						},
					],
				});

				const promisedListPo = listPo.map(({dataValues}) => {
					const val = dataValues as II;

					const u = val.OrmCustomerPOItems.map(cur => {
						const result = cur.OrmPOItemSppbIns.reduce(
							(ret, item) => ret + item.qty1,
							0,
						);
						return result === cur.qty1;
					}, []);
					return {...val, isClosed: !u.includes(false)};
				});

				const jash = await Promise.all(promisedListPo);

				const ddd = await routerCaller.customer_po.getPage({limit: 9999});

				return ddd.rows.map(e => {
					return {...e, isClosed: jash.find(u => u.id === e.id)?.isClosed};
				});
			});
		}),
	}),
	get: procedure
		.input(
			z.object({
				type: z.literal('sppb_in'),
				where: tCustomerSPPBIn.partial().optional(),
			}),
		)
		.query(async ({ctx, input}): Promise<SppbInRows[]> => {
			// FIXME: the type
			const routerCaller = appRouter.createCaller(ctx);

			const {rows} = await routerCaller.sppb.in.getPage({
				...input,
				limit: 99999999,
			});

			return rows;
		}),
	getPage: procedure
		.input(tableFormValue.partial())
		.query(({ctx: {req, res}, input}) => {
			const {sjIn, po, cust, inItem, poItem, item} = sppbInGetPage();
			const {limit = defaultLimit, page = 1, search} = input;

			return checkCredentialV2({req, res}, async (): Promise<GetPage> => {
				const {count, rows: rr} = await sjIn.model.findAndCountAll({
					limit,
					attributes: sjIn.attributes,
					offset: (page - 1) * limit,
					include: [
						{...po, include: [cust]},
						{
							...inItem,
							separate: true,
							order: [['createdAt', 'DESC']],
							include: [poItem, item],
						},
					],
					where: wherePagesV2<SppbInRows>(
						['nomor_surat', '$dPo.nomor_po$', '$dPo.dCust.name$'],
						search,
					),
				});

				const rows = rr.map(async e => {
					const val = e.toJSON() as unknown as SppbInRows;

					const {scores} = await getKanbanGrade({
						id_item: val.dInItems.map(({id}) => id),
					});

					const grade = averageGrade(scores, val.dInItems?.[0]?.createdAt);

					return {...val, grade};
				});

				return pagingResult(count, page, limit, await Promise.all(rows));
			});
		}),
	upsert: procedure
		.input(tUpsertSppbIn)
		.mutation(({ctx: {req, res}, input}) => {
			return checkCredentialV2({req, res}, async () => {
				const transaction = await ORM.transaction();

				try {
					const {id, po_item, ...rest} = input;

					const [{dataValues: createdSppb}] = await OrmCustomerSPPBIn.upsert(
						{...rest, id: id || generateId('SPPBIN_')},
						{transaction},
					);

					const existingPoItemPromises = (
						await OrmPOItemSppbIn.findAll({
							where: {id_sppb_in: createdSppb.id},
						})
					).map(({dataValues}) => {
						const itemFounded = po_item.find(item => item.id === dataValues.id);
						if (!itemFounded) {
							return OrmPOItemSppbIn.destroy({
								transaction,
								where: {id: dataValues.id},
							});
						}
						return null;
					});

					await Promise.all(existingPoItemPromises);
					let upserted = 0;

					for (const item of po_item) {
						const {id: idItem, id_item, included, id_sppb_in} = item;

						if (!included) {
							if (!idItem) continue;
							await OrmPOItemSppbIn.destroy({where: {id: idItem}});
							continue;
						}

						await OrmPOItemSppbIn.upsert(
							{
								...item,
								included,
								id_item,
								id_sppb_in: id_sppb_in || id || (createdSppb.id as string),
								id: idItem || generateId('SPPBINITM_'),
							},
							{transaction},
						);
						upserted++;
					}

					if (upserted > 0) {
						await transaction.commit();
						return Success;
					} else {
						throw new TRPCError({
							code: 'FORBIDDEN',
							message: 'Minimal harus ada 1 item yang di include',
						});
					}
				} catch (err) {
					await transaction.rollback();
					procedureError(err);
				}
			});
		}),
	delete: procedure
		.input(zId.partial())
		.mutation(({ctx: {req, res}, input: {id}}) => {
			return checkCredentialV2({req, res}, async () => {
				return OrmPOItemSppbIn.destroy({where: {id_sppb_in: id}}).then(() =>
					OrmCustomerSPPBIn.destroy({where: {id}}),
				);
			});
		}),
});

export default sppbInRouters;

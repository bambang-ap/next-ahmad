import {z} from 'zod';

import {UQty, UQtyList} from '@appTypes/app.type';
import {zIds} from '@appTypes/app.zod';
import {dIndex, exportKanbanAttributes, processMapper} from '@database';
import {getSJInGrade, RetCalculateScore} from '@db/getSjGrade';
import {REJECT_REASON_VIEW} from '@enum';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {dateUtils, itemInScanParser, qtyMap, renderIndex} from '@utils';

import {appRouter} from '..';

type InResult = {GRADE: RetCalculateScore} & Record<string, string | number>;

type OutResult = Record<
	| 'NO'
	| 'TANGGAL SJ KELUAR'
	| 'CUSTOMER'
	| 'NO SURAT JALAN MASUK'
	| 'PART NAME / ITEM'
	| 'PART NO'
	| 'NO LOT CUSTOMER'
	| 'NO PO'
	| 'NO KANBAN'
	| 'NO SURAT JALAN KELUAR'
	| 'TGL SJ MASUK'
	| 'NO LOT CUSTOMER'
	| 'PROSES'
	| 'KETERANGAN',
	string | number
> &
	Partial<Record<`${REJECT_REASON_VIEW} ${UQty}` | UQtyList, string>>;

const exportSppbRouters = router({
	in: procedure
		.input(z.object({ids: z.string().array()}))
		.query(({input, ctx}) => {
			type Data = typeof sjIn.obj & {
				OrmCustomerPO: typeof po.obj & {OrmCustomer: typeof cust.obj};
				OrmPOItemSppbIns: (typeof inItem.obj & {
					OrmMasterItem: typeof masterItem.obj;
					OrmCustomerPOItem: typeof poItem.obj;
					OrmKanbanItems: (typeof knbItem.obj & {
						OrmKanban: typeof kanban.obj & {dIndex: typeof tIndex.obj};
					})[];
				})[];
			};

			const {
				tIndex,
				kanban,
				sjIn,
				inItem,
				po,
				cust,
				poItem,
				knbItem,
				item: masterItem,
			} = exportKanbanAttributes();

			return checkCredentialV2(ctx, async (): Promise<InResult[]> => {
				let NO = 1;

				const result: InResult[] = [];
				const data = await sjIn.model.findAll({
					where: {id: input.ids},
					attributes: sjIn.attributes,
					include: [
						{...po, include: [cust]},
						{
							...inItem,
							include: [
								masterItem,
								poItem,
								{...knbItem, include: [{...kanban, include: [tIndex]}]},
							],
						},
					],
				});

				const sjGrades = await getSJInGrade({
					id: data.map(e => e.dataValues.id!),
				});

				for (let i = 0; i < data.length; i++) {
					const val = data[i]?.toJSON() as unknown as Data;
					const grade = sjGrades[i]!;

					for (const item of val.OrmPOItemSppbIns) {
						const instruksi = await processMapper(ctx, {
							instruksi: item.OrmMasterItem.instruksi,
							kategori_mesinn: item.OrmMasterItem.kategori_mesinn,
						});

						const noKanban = item.OrmKanbanItems.map(({OrmKanban}) => {
							return renderIndex(OrmKanban, OrmKanban.nomor_kanban);
						}).join(' | ');

						const qtyMapping = qtyMap(({qtyKey, unitKey}) => {
							const qty = item[qtyKey];
							if (!qty) return {[qtyKey.toUpperCase()]: ''};
							return {
								[qtyKey.toUpperCase()]: `${qty}`,
								[unitKey.toUpperCase()]: `${item.OrmCustomerPOItem[unitKey]}`,
							};
						});

						result.push({
							NO,
							'TANGGAL SJ MASUK': val.tgl,
							CUSTOMER: val.OrmCustomerPO.OrmCustomer.name,
							'NO PO': val.OrmCustomerPO.nomor_po,
							'NO SURAT JALAN MASUK': val.nomor_surat,
							'PART NAME': item.OrmMasterItem.name!,
							'PART NO': item.OrmMasterItem.kode_item!,
							'NO LOT CUSTOMER': item.lot_no!,
							'NOMOR KANBAN': noKanban,
							GRADE: grade.score,
							...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
							HARGA: item.OrmCustomerPOItem.harga!,
							PROSES: instruksi,
							KETERANGAN: item.OrmMasterItem.keterangan!,
						});
						NO++;
					}
				}

				return result;
			});
		}),
	out: procedure.input(zIds).query(({input, ctx}) => {
		return checkCredentialV2(ctx, async (): Promise<OutResult[]> => {
			let i = 0;
			const routerCaller = appRouter.createCaller(ctx);
			const dataSppbOut = await routerCaller.print.sppb.out(input);
			const result: OutResult[] = [];

			for (const itemOut of dataSppbOut) {
				const {date, invoice_no, dCust, dOutItems} = itemOut;
				for (const {dInItem, ...outItem} of dOutItems) {
					const {dPoItem, dSJIn, dItem, id, lot_no} = dInItem;
					const {dPo} = dPoItem;

					const instruksi = await processMapper(ctx, {
						instruksi: dItem.instruksi,
						kategori_mesinn: dItem.kategori_mesinn,
					});

					const {rejectedItems} = itemInScanParser(dInItem.id, dSJIn.dKanbans);

					const qtyMapping = qtyMap(({qtyKey, num, unitKey}) => {
						const qty = outItem[qtyKey];
						const unit = dPoItem?.[unitKey];
						const qtyRejectRP = rejectedItems?.[dInItem.id]?.RP?.[qtyKey];
						const qtyRejectTP = rejectedItems?.[dInItem.id]?.TP?.[qtyKey];

						if (!qty) return {};

						return {
							[qtyKey.ucwords()]: `${qty}`,
							[unitKey.ucwords()]: `${unit}`,
							...(qtyRejectTP
								? {
										[`${REJECT_REASON_VIEW.TP} ${num}`]: `${qtyRejectTP}`,
										[`UNIT ${REJECT_REASON_VIEW.TP} ${num}`]: `${unit}`,
								  }
								: {}),
							...(qtyRejectRP
								? {
										[`${REJECT_REASON_VIEW.RP} ${num}`]: `${qtyRejectRP}`,
										[`UNIT ${REJECT_REASON_VIEW.RP} ${num}`]: `${unit}`,
								  }
								: {}),
						};
					});

					const selectedKanban = dSJIn.dKanbans.find(a => {
						const index = a.dKnbItems.findIndex(b => b.id_item === id);
						return index >= 0;
					});

					i++;
					result.push({
						NO: i,
						'TGL SJ MASUK': dateUtils.full(dSJIn.tgl)!,
						CUSTOMER: dCust.name,
						'NO PO': dPo.nomor_po!,
						'NO SURAT JALAN MASUK': dSJIn?.nomor_surat!,
						'PART NAME / ITEM': dItem.name!,
						'PART NO': dItem.kode_item!,
						'NO LOT CUSTOMER': lot_no!,
						'NO KANBAN': renderIndex(selectedKanban!, {
							indexKey: dIndex._alias1,
						}),
						...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
						'TANGGAL SJ KELUAR': dateUtils.full(date)!,
						'NO SURAT JALAN KELUAR': renderIndex(itemOut, invoice_no!)!,
						PROSES: instruksi,
						KETERANGAN: dItem.keterangan!,
					});
				}
			}

			return result;
		});
	}),
});

export default exportSppbRouters;

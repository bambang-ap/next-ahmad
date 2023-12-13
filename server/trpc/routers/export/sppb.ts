import {z} from 'zod';

import {
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TMasterItem,
	TPOItem,
	TPOItemSppbIn,
	UQty,
	UQtyList,
} from '@appTypes/app.type';
import {zIds} from '@appTypes/app.zod';
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmMasterItem,
	OrmPOItemSppbIn,
	processMapper,
} from '@database';
import {REJECT_REASON_VIEW} from '@enum';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {itemInScanParser, qtyMap, renderIndex} from '@utils';

import {appRouter} from '..';

type InResult = Record<
	| 'NO'
	| 'TANGGAL SJ MASUK'
	| 'CUSTOMER'
	| 'NO PO'
	| 'NO SURAT JALAN MASUK'
	| 'PART NAME'
	| 'PART NO'
	| 'NO LOT CUSTOMER'
	| 'PROSES'
	| 'KETERANGAN',
	string
>;

type OutResult = Record<
	| 'NO'
	| 'TANGGAL SJ KELUAR '
	| 'CUSTOMER'
	| 'NO SURAT JALAN MASUK'
	| 'PART NAME / ITEM'
	| 'NO PO'
	| 'NO SURAT JALAN KELUAR'
	| 'PROSES'
	| 'KETERANGAN',
	string | number
> &
	Partial<Record<`${REJECT_REASON_VIEW} ${UQty}` | UQtyList, string>>;

const exportSppbRouters = router({
	in: procedure
		.input(z.object({ids: z.string().array()}))
		.query(({input, ctx}) => {
			type Data = TCustomerSPPBIn & {
				OrmCustomerPO: TCustomerPO & {OrmCustomer: TCustomer};
				OrmPOItemSppbIns: (TPOItemSppbIn & {
					OrmMasterItem: TMasterItem;
					OrmCustomerPOItem: TPOItem;
				})[];
			};
			return checkCredentialV2(ctx, async (): Promise<InResult[]> => {
				let NO = 1;
				const result: InResult[] = [];
				const data = await OrmCustomerSPPBIn.findAll({
					where: {id: input.ids},
					include: [
						{model: OrmCustomerPO, include: [OrmCustomer]},
						{
							separate: true,
							model: OrmPOItemSppbIn,
							include: [OrmMasterItem, OrmCustomerPOItem],
						},
					],
				});

				for (const {dataValues} of data) {
					const val = dataValues as Data;
					for (const item of val.OrmPOItemSppbIns) {
						const instruksi = await processMapper(ctx, {
							instruksi: item.OrmMasterItem.instruksi,
							kategori_mesinn: item.OrmMasterItem.kategori_mesinn,
						});
						const qtyMapping = qtyMap(({qtyKey, unitKey}) => {
							const qty = item[qtyKey];
							if (!qty) return {[qtyKey.toUpperCase()]: ''};
							return {
								[qtyKey.toUpperCase()]: `${qty}`,
								[unitKey.toUpperCase()]: `${item.OrmCustomerPOItem[unitKey]}`,
							};
						});

						result.push({
							NO: NO.toString(),
							'TANGGAL SJ MASUK': val.tgl,
							CUSTOMER: val.OrmCustomerPO.OrmCustomer.name,
							'NO PO': val.OrmCustomerPO.nomor_po,
							'NO SURAT JALAN MASUK': val.nomor_surat,
							'PART NAME': item.OrmMasterItem.name!,
							'PART NO': item.OrmMasterItem.kode_item!,
							'NO LOT CUSTOMER': item.lot_no!,
							...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
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
					const {dPoItem, dSJIn, dItem} = dInItem;
					const {dPo} = dPoItem;

					const instruksi = await processMapper(ctx, {
						instruksi: dItem.instruksi,
						kategori_mesinn: dItem.kategori_mesinn,
					});

					const {rejectedItems} = itemInScanParser(dInItem.id, dSJIn.dKanbans);

					const qtyMapping = qtyMap(({qtyKey, num, unitKey}) => {
						const qty = outItem[qtyKey];
						const unit = dPoItem?.[unitKey];
						const qtyRejectRP = rejectedItems.RP?.[qtyKey];
						const qtyRejectTP = rejectedItems.TP?.[qtyKey];

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

					i++;
					result.push({
						NO: i.toString(),
						CUSTOMER: dCust.name,
						'NO PO': dPo.nomor_po!,
						'NO SURAT JALAN MASUK': dSJIn?.nomor_surat!,
						'NO SURAT JALAN KELUAR': renderIndex(itemOut, invoice_no!)!,
						'TANGGAL SJ KELUAR ': date,
						'PART NAME / ITEM': dItem.name!,
						...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
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

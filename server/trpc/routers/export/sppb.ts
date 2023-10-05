import {z} from "zod";

import {
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TMasterItem,
	TPOItem,
	TPOItemSppbIn,
} from "@appTypes/app.type";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmMasterItem,
	OrmPOItemSppbIn,
	processMapper,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";
import {qtyMap} from "@utils";

import {appRouter} from "..";

type InResult = Record<
	| "NO"
	| "TANGGAL SJ MASUK"
	| "CUSTOMER"
	| "NO PO"
	| "NO SURAT JALAN MASUK"
	| "PART NAME"
	| "PART NO"
	| "NO LOT CUSTOMER"
	| "PROSES"
	| "KETERANGAN",
	string
>;

type OutResult = Record<
	| "NO"
	| "TANGGAL SJ KELUAR "
	| "CUSTOMER"
	| "NO SURAT JALAN MASUK"
	| "PART NAME / ITEM"
	| "NO PO"
	| "NO SURAT JALAN KELUAR"
	| "PROSES"
	| "KETERANGAN",
	string | number
>;

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
							if (!qty) return {[qtyKey.toUpperCase()]: ""};
							return {
								[qtyKey.toUpperCase()]: `${qty} ${item.OrmCustomerPOItem[unitKey]}`,
							};
						});

						result.push({
							NO: NO.toString(),
							"TANGGAL SJ MASUK": val.tgl,
							CUSTOMER: val.OrmCustomerPO.OrmCustomer.name,
							"NO PO": val.OrmCustomerPO.nomor_po,
							"NO SURAT JALAN MASUK": val.nomor_surat,
							"PART NAME": item.OrmMasterItem.name!,
							"PART NO": item.OrmMasterItem.kode_item!,
							"NO LOT CUSTOMER": item.lot_no!,
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
	out: procedure
		.input(z.object({id: z.string().array()}))
		.query(({input, ctx}) => {
			return checkCredentialV2(ctx, async (): Promise<OutResult[]> => {
				let i = 0;
				const routerCaller = appRouter.createCaller(ctx);
				const dataSppbOut = await routerCaller.print.sppb.out(input);
				const result: OutResult[] = [];

				for (const {
					date,
					invoice_no,
					dCust: OrmCustomer,
					dOutItems: OrmCustomerSPPBOutItems,
				} of dataSppbOut) {
					for (const {
						dInItem: OrmPOItemSppbIn,
						...OrmCustomerSPPBOutItem
					} of OrmCustomerSPPBOutItems) {
						const {
							dPoItem: OrmCustomerPOItem,
							dSJIn: OrmCustomerSPPBIn,
							dItem: OrmMasterItem,
						} = OrmPOItemSppbIn;
						const {dPo: OrmCustomerPO} = OrmCustomerPOItem;

						const instruksi = await processMapper(ctx, {
							instruksi: OrmMasterItem.instruksi,
							kategori_mesinn: OrmMasterItem.kategori_mesinn,
						});

						const qtyMapping = qtyMap(({qtyKey, unitKey}) => {
							const qty = OrmCustomerSPPBOutItem[qtyKey];
							if (!qty) return {[qtyKey.toUpperCase()]: ""};
							return {
								[qtyKey.toUpperCase()]: `${qty} ${OrmCustomerPOItem[unitKey]}`,
							};
						});

						i++;
						result.push({
							NO: i.toString(),
							CUSTOMER: OrmCustomer.name,
							"NO PO": OrmCustomerPO.nomor_po!,
							"NO SURAT JALAN MASUK": OrmCustomerSPPBIn?.nomor_surat!,
							"NO SURAT JALAN KELUAR": invoice_no,
							"TANGGAL SJ KELUAR ": date,
							"PART NAME / ITEM": OrmMasterItem.name!,
							...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
							PROSES: instruksi,
							KETERANGAN: OrmMasterItem.keterangan!,
						});
					}
				}

				return result;
			});
		}),
});

export default exportSppbRouters;

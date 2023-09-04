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
	OrmCustomerSPPBOut,
	OrmMasterItem,
	OrmPOItemSppbIn,
	processMapper,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";
import {qtyMap} from "@utils";

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
		.input(z.object({ids: z.string().array()}))
		.query(({input, ctx}) => {
			return checkCredentialV2(ctx, async (): Promise<OutResult[]> => {
				const result: OutResult[] = [];

				const data = await OrmCustomerSPPBOut.findAll({
					where: {id: input.ids},
					include: [OrmCustomer],
				});
				let i = 0;
				for (const {dataValues} of data) {
					const {po: listPo, invoice_no, date} = dataValues;

					for (const po of listPo) {
						const poo = await OrmCustomerPO.findOne({
							where: {id: po.id_po},
							include: [OrmCustomer],
						});
						const poooo = poo?.dataValues as TCustomerPO & {
							OrmCustomer: TCustomer;
						};

						for (const inn of po.sppb_in) {
							const sppbIn = await OrmCustomerSPPBIn.findOne({
								where: {id: inn.id_sppb_in},
							});

							const sppbInnnn = sppbIn?.dataValues;

							for (const [id_item, item] of Object.entries(inn.items)) {
								const dd = await OrmPOItemSppbIn.findOne({
									where: {id: id_item},
									include: [OrmMasterItem, {model: OrmCustomerPOItem}],
								});

								const ddddd = dd?.dataValues as TPOItemSppbIn & {
									OrmMasterItem: TMasterItem;
									OrmCustomerPOItem: TPOItem;
								};

								const qtyMapping = qtyMap(({qtyKey, unitKey}) => {
									const qty = item[qtyKey];
									if (!qty) return {[qtyKey.toUpperCase()]: ""};
									return {
										[qtyKey.toUpperCase()]: `${qty} ${ddddd.OrmCustomerPOItem[unitKey]}`,
									};
								});

								const instruksi = await processMapper(ctx, {
									instruksi: ddddd.OrmMasterItem.instruksi,
									kategori_mesinn: ddddd.OrmMasterItem.kategori_mesinn,
								});

								result.push({
									NO: i.toString(),
									CUSTOMER: poooo.OrmCustomer.name,
									"NO PO": poooo.nomor_po!,
									"NO SURAT JALAN MASUK": sppbInnnn?.nomor_surat!,
									"NO SURAT JALAN KELUAR": invoice_no,
									"TANGGAL SJ KELUAR ": date,
									"PART NAME / ITEM": ddddd.OrmMasterItem.name!,
									...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
									PROSES: instruksi,
									KETERANGAN: ddddd.OrmMasterItem.keterangan!,
								});
								i++;
							}
						}
					}
				}

				return result;
			});
		}),
});

export default exportSppbRouters;

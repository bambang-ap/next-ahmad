import {z} from "zod";

import {
	TCustomer,
	TCustomerPO,
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

import {appRouter} from "..";

type OutResult = Record<
	// FIXME: add number
	// | "NO"
	| "TANGGAL SJ KELUAR "
	| "CUSTOMER"
	| "NO SURAT JALAN MASUK"
	| "PART NAME / ITEM"
	| "NO PO"
	| "NO SURAT JALAN KELUAR"
	| "PROSES",
	string | number
>;

const exportSppbRouters = router({
	out: procedure
		.input(z.object({ids: z.string().array()}))
		.query(({input, ctx}) => {
			return checkCredentialV2(ctx, async (): Promise<OutResult[]> => {
				const routerCaller = appRouter.createCaller(ctx);
				const result: OutResult[] = [];

				const data = await OrmCustomerSPPBOut.findAll({
					where: {id: input.ids},
					include: [OrmCustomer],
				});
				// let NO = 0;
				for (const {dataValues} of data) {
					// NO++;
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
									// NO,
									CUSTOMER: poooo.OrmCustomer.name,
									"NO PO": poooo.nomor_po!,
									"NO SURAT JALAN MASUK": sppbInnnn?.nomor_surat!,
									"NO SURAT JALAN KELUAR": invoice_no,
									"TANGGAL SJ KELUAR ": date,
									"PART NAME / ITEM": ddddd.OrmMasterItem.name!,
									...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
									PROSES: instruksi,
								});
							}
						}
					}
				}

				return result;
			});
		}),
});

export default exportSppbRouters;

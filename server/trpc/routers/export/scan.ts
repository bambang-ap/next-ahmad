import {moment} from "@utils";
import {z} from "zod";

import {
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TKanban,
	TKanbanItem,
	TMasterItem,
	TPOItem,
	TPOItemSppbIn,
	TScan,
	tScanTarget,
	ZId,
} from "@appTypes/app.zod";
import {formatDateStringView, formatHour, qtyList} from "@constants";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmKategoriMesin,
	OrmMasterItem,
	OrmMesin,
	OrmPOItemSppbIn,
	OrmScan,
	OrmScanOrder,
	processMapper,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure} from "@trpc";

const exportScanRouters = {
	scan: procedure
		.input(
			z.object({
				route: tScanTarget,
				idKanbans: z.string().array(),
			}),
		)
		.query(({ctx, input}) => {
			type JJJ = Record<
				| "NO"
				| "TANGGAL PROSES"
				| "CUSTOMER"
				| "PART NAME"
				| "PART NO"
				| "QTY / JUMLAH"
				| "WAKTU / JAM PROSES"
				| "NO LOT CUSTOMER"
				| "NO LOT IMI"
				| "PROSES"
				| "NOMOR KANBAN"
				| "NOMOR MESIN"
				| "NAMA MESIN"
				| "KETERANGAN",
				string
			>;

			type OO = TScan & {
				OrmKanban: TKanban & {
					OrmCustomerSPPBIn: TCustomerSPPBIn & {
						OrmPOItemSppbIns: TPOItemSppbIn[];
					};
					OrmCustomerPO: TCustomerPO & {
						OrmCustomer: TCustomer;
						OrmCustomerPOItems: TPOItem[];
					};
					OrmKanbanItems: (TKanbanItem & {
						OrmMasterItem: TMasterItem;
						OrmPOItemSppbIn: ZId;
					})[];
				};
			};
			const {route, idKanbans: idScans} = input;

			return checkCredentialV2(ctx, async (): Promise<JJJ[]> => {
				const data = await OrmScan.findAll({
					where: {id_kanban: idScans, [`status_${route}`]: true},
					order: OrmScanOrder(route),
					include: [
						{
							model: OrmKanban,
							include: [
								{model: OrmCustomerSPPBIn, include: [OrmPOItemSppbIn]},
								{
									model: OrmCustomerPO,
									include: [OrmCustomer, OrmCustomerPOItem],
								},
								{
									model: OrmKanbanItem,
									include: [
										OrmMasterItem,
										{model: OrmPOItemSppbIn, attributes: ["id"]},
									],
								},
							],
						},
					],
				});

				const promisedData = data.map(async ({dataValues}, i): Promise<JJJ> => {
					const val = dataValues as OO;

					// return val

					const date = val.date?.[`${route}_updatedAt`];

					const item = val.OrmKanban.OrmKanbanItems?.[0];
					const sppbInItem =
						val.OrmKanban.OrmCustomerSPPBIn.OrmPOItemSppbIns.find(
							e => e.id === item?.id_item,
						);
					const poItem = val.OrmKanban.OrmCustomerPO.OrmCustomerPOItems.find(
						itm => itm.id === sppbInItem?.id_item,
					);

					const enIe = val?.[`item_${route}`]
						?.map(([, qty], i) => {
							const index = (i + 1) as typeof qtyList[number];
							const unit = poItem?.[`unit${index}`];
							return `${qty} ${unit}`;
						})
						.filter(Boolean);

					const instruksi = await processMapper(ctx, {
						instruksi: item?.OrmMasterItem.instruksi,
						kategori_mesinn: item?.OrmMasterItem.kategori_mesinn,
					});

					const mesinnnn = await OrmMesin.findAll({
						where: {id: val.OrmKanban.list_mesin[item?.OrmPOItemSppbIn.id!]},
						include: [{model: OrmKategoriMesin, as: OrmKategoriMesin._alias}],
					});

					return {
						NO: (i + 1).toString(),
						"TANGGAL PROSES": date
							? moment(date).format(formatDateStringView)
							: "",
						CUSTOMER: val.OrmKanban.OrmCustomerPO.OrmCustomer.name,
						"PART NAME": item?.OrmMasterItem.name!,
						"PART NO": item?.OrmMasterItem.kode_item!,
						"QTY / JUMLAH": enIe?.join("|")!,
						"WAKTU / JAM PROSES": date ? moment(date).format(formatHour) : "",
						"NO LOT CUSTOMER": sppbInItem?.lot_no!,
						"NO LOT IMI": val.lot_no_imi,
						PROSES: instruksi,
						"NOMOR KANBAN": val.OrmKanban.nomor_kanban,
						"NAMA MESIN": mesinnnn
							// @ts-ignore
							.map(e => e.dataValues[OrmKategoriMesin._alias].name)
							.join(" | "),
						"NOMOR MESIN": mesinnnn
							.map(e => e.dataValues.nomor_mesin)
							.join(" | "),
						KETERANGAN: val.OrmKanban.keterangan ?? "",
					};
				});

				return Promise.all(promisedData);
			});
		}),
};
export default exportScanRouters;

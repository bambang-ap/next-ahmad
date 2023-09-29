import {z} from "zod";

import {tScanTarget} from "@appTypes/app.zod";
import {formatDateStringView, formatHour, qtyList} from "@constants";
import {
	exportScanAttributes,
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
import {moment} from "@utils";

const exportScanRouters = {
	scan: procedure
		.input(
			z.object({
				route: tScanTarget,
				idScans: z.string().array(),
			}),
		)
		.query(({ctx, input}) => {
			const {route, idScans} = input;

			const {A, B, C, D, E, F, G, H, I, J, Ret, Output} =
				exportScanAttributes(route);

			type JJJ = typeof Output;
			type OO = typeof Ret;

			return checkCredentialV2(ctx, async (): Promise<JJJ[]> => {
				const data = await OrmScan.findAll({
					where: {id: idScans, [`status_${route}`]: true},
					order: OrmScanOrder(route),
					attributes: A.keys,
					include: [
						{
							attributes: B.keys,
							model: OrmKanban,
							include: [
								{
									attributes: C.keys,
									model: OrmCustomerSPPBIn,
									include: [{model: OrmPOItemSppbIn, attributes: D.keys}],
								},
								{
									model: OrmCustomerPO,
									attributes: E.keys,
									include: [
										{attributes: F.keys, model: OrmCustomer},
										{attributes: G.keys, model: OrmCustomerPOItem},
									],
								},
								{
									model: OrmKanbanItem,
									attributes: H.keys,
									include: [
										{model: OrmMasterItem, attributes: I.keys},
										{model: OrmPOItemSppbIn, attributes: J.keys},
									],
								},
							],
						},
					],
				});

				const promisedData = data.map(async ({dataValues}, i): Promise<JJJ> => {
					// @ts-ignore
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

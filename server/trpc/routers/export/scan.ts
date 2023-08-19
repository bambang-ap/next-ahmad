import moment from "moment";
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
} from "@appTypes/app.zod";
import {formatDateStringView, formatHour, qtyList} from "@constants";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScan,
	processMapper,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure} from "@trpc";

const exportScanRouters = procedure
	.input(
		z.object({
			route: tScanTarget,
			idKanbans: z.string().array(),
		}),
	)
	.query(({ctx, input}) => {
		type JJJ = Record<
			| "TANGGAL PROSES"
			| "CUSTOMER"
			| "PART NAME"
			| "PART NO"
			| "QTY / JUMLAH"
			| "WAKTU / JAM"
			| "PROSES"
			| "NO LOT CUSTOMER"
			| "NO LOT IMI"
			| "PROSES"
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
				OrmKanbanItems: (TKanbanItem & {OrmMasterItem: TMasterItem})[];
			};
		};
		const {route, idKanbans: idScans} = input;

		return checkCredentialV2(ctx, async (): Promise<JJJ[]> => {
			const data = await OrmScan.findAll({
				where: {id_kanban: idScans, [`status_${route}`]: true},
				include: [
					{
						model: OrmKanban,
						include: [
							{model: OrmCustomerSPPBIn, include: [OrmPOItemSppbIn]},
							{model: OrmCustomerPO, include: [OrmCustomer, OrmCustomerPOItem]},
							{model: OrmKanbanItem, include: [OrmMasterItem]},
						],
					},
				],
			});

			const promisedData = data.map(async ({dataValues}): Promise<JJJ> => {
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

				return {
					"TANGGAL PROSES": date
						? moment(date).format(formatDateStringView)
						: "",
					CUSTOMER: val.OrmKanban.OrmCustomerPO.OrmCustomer.name,
					"PART NAME": item?.OrmMasterItem.name!,
					"PART NO": item?.OrmMasterItem.kode_item!,
					"QTY / JUMLAH": enIe?.join("|")!,
					"WAKTU / JAM": date ? moment(date).format(formatHour) : "",
					"NO LOT CUSTOMER": sppbInItem?.lot_no!,
					"NO LOT IMI": val.lot_no_imi,
					PROSES: instruksi,
					KETERANGAN: val.OrmKanban.keterangan!,
				};
			});

			return Promise.all(promisedData);
		});
	});

export default exportScanRouters;

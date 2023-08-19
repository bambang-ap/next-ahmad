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
} from "@appTypes/app.zod";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	processMapper,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure} from "@trpc";
import {qtyMap} from "@utils";

const exportKanbanRouters = {
	kanban: procedure
		.input(z.object({idKanbans: z.string().array()}))
		.query(({ctx, input}) => {
			const {idKanbans} = input;

			type JJJ = Record<
				| "CUSTOMER"
				| "NOMOR PO"
				| "NOMOR SJ"
				| "NOMOR KANBAN"
				| "PART NAME"
				| "PART NO"
				| "QTY / JUMLAH"
				| "PROSES"
				| "KETERANGAN",
				string
			>;
			type OOO = TKanban & {
				OrmCustomerSPPBIn: TCustomerSPPBIn & {
					OrmPOItemSppbIns: TPOItemSppbIn[];
				};
				OrmCustomerPO: TCustomerPO & {
					OrmCustomer: TCustomer;
					OrmCustomerPOItems: TPOItem[];
				};
				OrmKanbanItems: (TKanbanItem & {OrmMasterItem: TMasterItem})[];
			};

			return checkCredentialV2(ctx, async (): Promise<JJJ[]> => {
				const data = await OrmKanban.findAll({
					where: {id: idKanbans},
					include: [
						{model: OrmCustomerSPPBIn, include: [OrmPOItemSppbIn]},
						{
							model: OrmCustomerPO,
							include: [OrmCustomer, OrmCustomerPOItem],
						},
						{model: OrmKanbanItem, include: [OrmMasterItem]},
					],
				});

				const promisedData = data.map<Promise<JJJ>>(async ({dataValues}) => {
					const val = dataValues as OOO;

					const item = val.OrmKanbanItems?.[0];
					const {instruksi, kategori_mesinn, kode_item, name} =
						item?.OrmMasterItem ?? {};

					const sppbInItem = val.OrmCustomerSPPBIn.OrmPOItemSppbIns.find(
						e => e.id === item?.id_item,
					);
					const poItem = val.OrmCustomerPO.OrmCustomerPOItems.find(
						itm => itm.id === sppbInItem?.id_item,
					);

					const proses = await processMapper(ctx, {instruksi, kategori_mesinn});

					return {
						CUSTOMER: val.OrmCustomerPO.OrmCustomer.name,
						"NOMOR PO": val.OrmCustomerPO.nomor_po,
						"NOMOR SJ": val.OrmCustomerSPPBIn.nomor_surat,
						"NOMOR KANBAN": val.nomor_kanban,
						"PART NAME": name!,
						"PART NO": kode_item!,
						"QTY / JUMLAH": qtyMap(({qtyKey, unitKey}) => {
							const qty = item?.[qtyKey];
							const unit = poItem?.[unitKey];
							if (!qty) return;
							return `${qty} ${unit}`;
						})
							.filter(Boolean)
							.join(" | "),
						PROSES: proses,
						KETERANGAN: val.keterangan!,
					};
				});

				return Promise.all(promisedData);
			});
		}),
};

export default exportKanbanRouters;

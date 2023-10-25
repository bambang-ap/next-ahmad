import {z} from 'zod';

import {
	exportKanbanAttributes,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	processMapper,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';
import {qtyMap} from '@utils';

const exportKanbanRouters = {
	kanban: procedure
		.input(z.object({idKanbans: z.string().array()}))
		.query(({ctx, input}) => {
			const {idKanbans} = input;
			const {A, B, C, D, E, F, G, H, Ret, Output} = exportKanbanAttributes();

			type JJJ = typeof Output;

			return checkCredentialV2(ctx, async (): Promise<JJJ[]> => {
				const data = await OrmKanban.findAll({
					where: {id: idKanbans},
					attributes: A.keys,
					include: [
						{
							model: OrmCustomerSPPBIn,
							attributes: B.keys,
							include: [{model: OrmPOItemSppbIn, attributes: C.keys}],
						},
						{
							model: OrmCustomerPO,
							attributes: D.keys,
							include: [
								{attributes: E.keys, model: OrmCustomer},
								{attributes: F.keys, model: OrmCustomerPOItem},
							],
						},
						{
							model: OrmKanbanItem,
							attributes: G.keys,
							include: [{model: OrmMasterItem, attributes: H.keys}],
						},
					],
				});

				const promisedData = data.map<Promise<JJJ>>(async ({dataValues}) => {
					// @ts-ignore
					const val = dataValues as typeof Ret;

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
						'NOMOR PO': val.OrmCustomerPO.nomor_po,
						'NOMOR SJ': val.OrmCustomerSPPBIn.nomor_surat,
						'NOMOR KANBAN': val.nomor_kanban,
						'PART NAME': name!,
						'PART NO': kode_item!,
						'QTY / JUMLAH': qtyMap(({qtyKey, unitKey}) => {
							const qty = item?.[qtyKey];
							const unit = poItem?.[unitKey];
							if (!qty) return;
							return `${qty} ${unit}`;
						})
							.filter(Boolean)
							.join(' | '),
						PROSES: proses,
						KETERANGAN: val.keterangan!,
					};
				});

				return Promise.all(promisedData);
			});
		}),
};

export default exportKanbanRouters;

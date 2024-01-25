import {z} from 'zod';

import {exportKanbanAttributes, OrmKanban, processMapper} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';
import {qtyMap, renderIndex} from '@utils';

const exportKanbanRouters = {
	kanban: procedure
		.input(z.object({idKanbans: z.string().array()}))
		.query(({ctx, input}) => {
			const {idKanbans} = input;
			const {
				kanban: A,
				sjIn: B,
				inItem: C,
				po: D,
				cust: E,
				poItem: F,
				knbItem: G,
				item: H,
				tIndex,
				Ret,
				Output,
			} = exportKanbanAttributes();

			type JJJ = typeof Output;

			return checkCredentialV2(ctx, async (): Promise<JJJ[]> => {
				const data = await OrmKanban.findAll({
					where: {id: idKanbans},
					attributes: A.attributes,
					include: [
						tIndex,
						{...B, include: [C]},
						{...D, include: [E, F]},
						{...G, include: [H]},
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

					const qtyMapping = qtyMap(({qtyKey, unitKey}) => {
						const qty = item?.[qtyKey];
						if (!qty) return {[qtyKey.toUpperCase()]: ''};
						return {
							[qtyKey.toUpperCase()]: `${qty}`,
							[unitKey.toUpperCase()]: `${poItem?.[unitKey]}`,
						};
					});

					return {
						CUSTOMER: val.OrmCustomerPO.OrmCustomer.name,
						'NOMOR PO': val.OrmCustomerPO.nomor_po,
						'NOMOR SJ': val.OrmCustomerSPPBIn.nomor_surat,
						'NOMOR KANBAN': renderIndex(val, val.nomor_kanban!)!,
						'PART NAME': name!,
						'PART NO': kode_item!,
						...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
						PROSES: proses,
						KETERANGAN: val.keterangan!,
					};
				});

				return Promise.all(promisedData);
			});
		}),
};

export default exportKanbanRouters;

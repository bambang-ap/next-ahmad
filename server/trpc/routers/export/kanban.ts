import {zIds} from '@appTypes/app.zod';
import {processMapper} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';
import {qtyMap, renderIndex} from '@utils';

import {getPrintKanbanData} from '../print/kanban';

const exportKanbanRouters = {
	kanban: procedure.input(zIds).query(({ctx, input}) => {
		type Output = Record<string, string | number>;

		return checkCredentialV2(ctx, async (): Promise<Output[]> => {
			const data = await getPrintKanbanData(input);

			const dataMapping = data.map(async val => {
				const {OrmKanban, OrmPOItemSppbIn} = val;
				const {OrmCustomerPO, keterangan} = OrmKanban;
				const {OrmCustomerSPPBIn, OrmCustomerPOItem} = OrmPOItemSppbIn;
				const {OrmMasterItem, harga} = OrmCustomerPOItem;
				const {kode_item, name, instruksi, kategori_mesinn} = OrmMasterItem;

				const qtyMapping = qtyMap(({qtyKey, unitKey}) => {
					const qty = val?.[qtyKey];

					return {
						[qtyKey.toUpperCase()]: !qty ? '' : `${qty}`,
						[unitKey.toUpperCase()]: !qty
							? ''
							: `${OrmCustomerPOItem?.[unitKey]}`,
					};
				});

				const proses = await processMapper({instruksi, kategori_mesinn});

				const result = {
					CUSTOMER: OrmCustomerPO.OrmCustomer.name,
					'NOMOR PO': OrmCustomerPO.nomor_po,
					'NOMOR SJ': OrmCustomerSPPBIn.nomor_surat,
					'NOMOR KANBAN': renderIndex(OrmKanban, OrmKanban.nomor_kanban!)!,
					'PART NAME': name!,
					'PART NO': kode_item!,
					...qtyMapping.reduce((a, b) => ({...a, ...b}), {}),
					HARGA: harga!,
					PROSES: proses,
					KETERANGAN: keterangan!,
				};

				return result as Output;
			});

			return Promise.all(dataMapping);
		});
	}),
};

export default exportKanbanRouters;

import {TItemUnitInternal, zIds} from '@appTypes/app.zod';
import {ppnMultiply} from '@constants';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

import {appRouter} from '..';

import exportKanbanRouters from './kanban';
import exportPoRouters from './po';
import exportScanRouters from './scan';
import exportSppbRouters from './sppb';

export type RetExportStock = {
	unit: TItemUnitInternal;
	qty_masuk: number;
	qty_keluar: number;
	qty_stock: number;
	harga: number;
	ppn: number;
	supplier: string;
	kode_item: string;
	name_item: string;
};

const exportRouters = router({
	...exportPoRouters,
	...exportScanRouters,
	...exportKanbanRouters,
	sppb: exportSppbRouters,
	internal: router({
		po: procedure.input(zIds).query(({ctx, input}) => {
			return checkCredentialV2(ctx, async (): Promise<RetExportStock[]> => {
				const caller = appRouter.createCaller(ctx);
				const {rows} = await caller.internal.stock.get({...input, limit: 9999});

				const dd = rows.map(item => {
					const {
						oSup: dSSUp,
						kode,
						nama,
						harga,
						ppn,
						qty,
						unit,
						oItem,
						usedQty,
					} = item;

					return {
						unit,
						qty_masuk: qty,
						qty_keluar: usedQty,
						qty_stock: qty - usedQty,
						supplier: dSSUp?.nama,
						harga: oItem?.harga ?? harga,
						kode_item: oItem?.kode ?? kode,
						name_item: oItem?.nama ?? nama,
						ppn: ppn ? (oItem?.harga ?? harga) * ppnMultiply : 0,
					};
				});

				return dd;
			});
		}),
	}),
});

export default exportRouters;

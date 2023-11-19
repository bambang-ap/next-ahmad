import {TItemUnitInternal, zIds} from '@appTypes/app.zod';
import {ppnMultiply} from '@constants';
import {
	internalInAttributes,
	internalPoAttributes,
	internalStockAttributes,
	oSup,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {dateUtils} from '@utils';

import {appRouter} from '..';

export type RetExportStock = {
	Unit: TItemUnitInternal;
	'Qty Masuk': number;
	'Qty Keluar': number;
	'Qty Stock': number;
	'Kode Item': string;
	'Nama Item': string;
	Supplier: string;
	Harga: number;
	PPn: number;
	No: number;
};

const exportInternalRouters = router({
	stock: procedure.input(zIds).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async (): Promise<RetExportStock[]> => {
			const caller = appRouter.createCaller(ctx);
			const {rows} = await caller.internal.stock.get({...input, limit: 9999});

			return rows.map((item, i) => {
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
					No: i + 1,
					Supplier: dSSUp?.nama,
					'Kode Item': oItem?.kode ?? kode,
					'Nama Item': oItem?.nama ?? nama,
					Harga: oItem?.harga ?? harga,
					PPn: ppn ? (oItem?.harga ?? harga) * ppnMultiply : 0,
					'Qty Masuk': qty,
					'Qty Stock': qty - usedQty,
					'Qty Keluar': usedQty,
					Unit: unit,
				};
			});
		});
	}),

	supplier: procedure.input(zIds).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			const data = await oSup.findAll({where: {id: input.ids}});

			return data.map((e, i) => {
				const {nama, alamat, telp, npwp} = e.toJSON();

				return {
					No: i + 1,
					'Nama Suplier': nama,
					'No Telp': telp,
					Alamat: alamat,
					NPWP: npwp,
				};
			});
		});
	}),

	item: procedure.input(zIds).query(({ctx, input}) => {
		const {item, sup} = internalPoAttributes();

		type Ret = typeof item.obj & {oSup?: typeof sup.obj};

		return checkCredentialV2(ctx, async () => {
			const data = await item.model.findAll({
				include: [sup],
				where: {id: input.ids},
				attributes: item.attributes,
			});

			return data.map((e, i) => {
				const {nama, oSup, harga, kode, ppn} = e.toJSON() as unknown as Ret;

				return {
					No: i + 1,
					Supplier: oSup?.nama,
					'Kode Item': kode,
					'Nama Item': nama,
					Harga: harga,
					PPn: ppn ? harga * ppnMultiply : 0,
				};
			});
		});
	}),

	out: procedure.input(zIds).query(({ctx, input}) => {
		const {inItem, poItem} = internalInAttributes();
		const {item, stock, out} = internalStockAttributes();

		type Ret = typeof out.obj & {
			oStock?: typeof stock.obj & {
				oItem: typeof item.obj;
				oInItem: typeof inItem.obj & {oPoItem: typeof poItem.obj};
			};
		};

		return checkCredentialV2(ctx, async () => {
			const data = await out.model.findAll({
				include: [{...stock, include: [{...inItem, include: [poItem]}, item]}],
				where: {id: input.ids},
				attributes: out.attributes,
			});

			return data.map((e, i) => {
				const {oStock, qty, user, createdAt} = e.toJSON() as unknown as Ret;
				const {oInItem, oItem} = oStock ?? {};
				const {oPoItem} = oInItem ?? {};
				const {unit} = oPoItem ?? {};

				return {
					No: i + 1,
					Date: dateUtils.full(createdAt),
					'Kode Item': oItem?.kode,
					'Nama Item': oItem?.nama,
					qty,
					unit,
					user,
				};
			});
		});
	}),
});

export default exportInternalRouters;

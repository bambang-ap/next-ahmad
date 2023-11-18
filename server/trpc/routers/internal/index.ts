import {internalInAttributes, internalStockAttributes} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

import {inRouters} from './inRouters';
import {itemRouters} from './itemRouters';
import {outBarangRouters} from './out_barang';
import {poRouters} from './poRouters';
import {requestRouters} from './request';
import {stockRouters} from './stockRouters';
import {supplierRouters} from './supplierRouters';

const internalRouters = router({
	item: itemRouters,
	supplier: supplierRouters,
	po: poRouters,
	in: inRouters,
	request: requestRouters,
	stock: stockRouters,
	out: outBarangRouters,
	dashboard: procedure.query(({ctx}) => {
		const {out, stock} = internalStockAttributes();
		const {item, po, poItem} = internalInAttributes();

		type Ret = typeof po.obj & {
			oPoItems: (typeof poItem.obj & {
				oItem: typeof item.obj & {
					oStocks: (typeof stock.obj & {oOuts: typeof out.obj[]})[];
				};
			})[];
		};

		return checkCredentialV2(ctx, async () => {
			const data = await po.model.findAll({
				include: [
					{
						...poItem,
						include: [{...item, include: [{...stock, include: [out]}]}],
					},
				],
			});

			const ret = data.map(e => {
				const {oPoItems, ...val} = e.toJSON() as unknown as Ret;

				const result = oPoItems.map(itemPo => {
					const {oItem, qty, unit} = itemPo;
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {oStocks: _, ...ie} = oItem;
					const total = {totalPo: qty, totalIn: 0, totalOut: 0, unit};

					itemPo.oItem.oStocks.forEach(itemStock => {
						total.totalIn += itemStock.qty;
						itemStock.oOuts.forEach(itemOut => {
							total.totalOut += itemOut.qty;
						});
					});

					return {
						...total,
						item: ie,
						totalStock: total.totalIn + total.totalOut,
					};
				});

				return {...val, result};
			});

			return ret;
		});
	}),
});

export default internalRouters;

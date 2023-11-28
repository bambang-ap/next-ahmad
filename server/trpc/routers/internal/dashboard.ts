import {col, fn} from 'sequelize';

import {tDateFilter} from '@appTypes/app.zod';
import {
	oInItem,
	oItem,
	oOut,
	oPoItem,
	oStock,
	whereDateFilter,
} from '@database';
import {MenuColorClass} from '@enum';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';

import {U} from '../dashboard/main';

export type UU = U & Partial<Record<'harga1' | 'harga2', string>>;

export const dashboardRouters = procedure
	.input(tDateFilter.partial())
	.query(({ctx, input}) => {
		const order = 'DESC';
		return checkCredentialV2(ctx, async () => {
			const poQty = await oPoItem.findAll({
				logging: true,
				where: whereDateFilter('$oPoItem.createdAt$', input),
				order: [[col('oPoItem.unit'), order]],
				group: [col('oPoItem.unit'), col('oItem.harga')],
				include: [{model: oItem, attributes: []}],
				attributes: [
					['unit', 'unit'],
					[col('oItem.harga'), 'harga1'],
					[fn('sum', col('qty')), 'qty'],
				],
			});

			const sjInQty = await oInItem.findAll({
				where: whereDateFilter('$oPoItem.createdAt$', input),
				order: [[col('oPoItem.unit'), order]],
				group: [col('oPoItem.unit'), col('oPoItem.oItem.harga')],
				include: [
					{
						model: oPoItem,
						attributes: [],
						include: [{model: oItem, attributes: []}],
					},
				],
				attributes: [
					[col('oPoItem.unit'), 'unit'],
					[col('oPoItem.oItem.harga'), 'harga1'],
					[fn('sum', col('oInItem.qty')), 'qty'],
				],
			});

			const stockQty = await oStock.findAll({
				where: whereDateFilter('$oStock.createdAt$', input),
				order: [[col('oStock.unit'), order]],
				group: [col('oStock.unit'), col('oStock.harga'), col('oItem.harga')],
				include: [
					{model: oItem, attributes: []},
					{
						model: oInItem,
						attributes: [],
						include: [{model: oPoItem, attributes: []}],
					},
				],
				attributes: [
					[col('oStock.unit'), 'unit'],
					[fn('sum', col('oStock.qty')), 'qty'],
					[col('oItem.harga'), 'harga1'],
					[col('oStock.harga'), 'harga2'],
				],
			});

			const outQty = await oOut.findAll({
				where: whereDateFilter('$oOut.createdAt$', input),
				order: [[col('oStock.unit'), order]],
				group: [
					col('oStock.unit'),
					col('oStock.harga'),
					col('oStock.oItem.harga'),
				],
				include: [
					{
						model: oStock,
						attributes: [],
						include: [{model: oItem, attributes: []}],
					},
				],
				attributes: [
					[col('oStock.unit'), 'unit'],
					[fn('sum', col('oOut.qty')), 'qty'],
					[col('oStock.oItem.harga'), 'harga1'],
					[col('oStock.harga'), 'harga2'],
				],
			});

			const kk = {
				'Jumlah PO': {
					className: MenuColorClass.PO,
					data: poQty.map(e => e.toJSON() as unknown as UU),
				},
				'SJ Masuk': {
					className: MenuColorClass.SJIn,
					data: sjInQty.map(e => e.toJSON() as unknown as UU),
				},
				'Barang Keluar': {
					className: MenuColorClass.SJOut,
					data: outQty.reduce<UU[]>((ret, e) => {
						const val = e.toJSON() as unknown as UU;

						const index = ret.findIndex(
							e => e.harga1 == val.harga2 || e.harga2 == val.harga2,
						);

						if (index >= 0) {
							const jj = ret?.[index] as UU;
							return ret.replace(index, {...jj, qty: jj?.qty + val.qty});
						} else ret.push(val);

						return ret;
					}, []),
				},
				get Stock() {
					return {
						className: MenuColorClass.QC,
						data: stockQty.reduce<UU[]>((ret, e) => {
							const val = e.toJSON() as unknown as UU;
							const outBarang = this['Barang Keluar'].data.find(
								e => e.unit === val.unit,
							);

							const index = ret.findIndex(
								e => e.harga1 == val.harga2 || e.harga2 == val.harga2,
							);

							if (index >= 0) {
								const jj = ret?.[index] as UU;
								return ret.replace(index, {...jj, qty: jj?.qty + val.qty});
							} else ret.push({...val, qty: val.qty - (outBarang?.qty ?? 0)});

							return ret;
						}, []),
					};
				},
			};

			return kk;
		});
	});

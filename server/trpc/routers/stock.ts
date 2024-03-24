import {TDecimal, UnitQty, UQty} from '@appTypes/app.type';
import {tableFormValue, zIds} from '@appTypes/app.zod';
import {
	attrParserExclude,
	attrParserV2,
	dIndex,
	dInItem,
	dItem,
	dOutItem,
	dSJIn,
	dSjOut,
	wherePagesV2,
} from '@database';
import {checkCredentialV2, pagingResult} from '@server';
import {procedure, router} from '@trpc';
import {dateUtils, renderIndex} from '@utils';

export default function stockRouters() {
	type A = ReturnType<typeof attributes>;

	type Ret = A['Ret'];

	function attributes() {
		const qtys: (keyof UnitQty)[] = ['qty1', 'qty2', 'qty3'];
		const item = attrParserExclude(dItem.unscoped(), [
			'instruksi',
			'kategori_mesinn',
			'default_mesin',
			'kategori_mesin',
			'keterangan',
			'harga',
			'unit_notes',
		]);
		const sjIn = attrParserV2(dSJIn, ['nomor_surat']);
		const sjOut = attrParserV2(dSjOut, ['index_id', 'index_number']);
		const tIndex = attrParserV2(dIndex);
		const inItem = attrParserV2(dInItem, qtys, true);
		const outItem = attrParserV2(dOutItem, qtys, true);
		const inItem2 = attrParserV2(dInItem, [...qtys, 'createdAt']);
		const outItem2 = attrParserV2(dOutItem, [...qtys, 'createdAt']);

		type RetA = typeof item.obj & {
			dInItems: (typeof inItem.obj & {dOutItems: typeof outItem.obj[]})[];
		};
		type RetB = typeof item.obj &
			Record<ToString<`${UQty}`, 'inQty' | 'outQty'>, null | TDecimal>;

		return {
			qtys,
			item,
			inItem,
			outItem,
			inItem2,
			outItem2,
			sjIn,
			sjOut,
			tIndex,
			Ret: {} as RetA,
			Rett: {} as RetB,
		};
	}

	return router({
		get: procedure.input(tableFormValue).query(({ctx, input}) => {
			const {limit, page, search} = input;

			const {item, inItem2, outItem2} = attributes();

			return checkCredentialV2(ctx, async () => {
				const {count: c1, rows: r1} = await item.model.findAndCountAll({
					limit,
					offset: (page - 1) * limit,
					attributes: item.attributes,
					where: wherePagesV2<Ret>(['name', 'kode_item'], search),
					include: [{...inItem2, include: [{...outItem2, separate: true}]}],
				});

				const resultData = r1.map(rowItem => {
					const {dInItems, ...rr} = rowItem.toJSON() as unknown as Ret;
					const result = {
						...rr,
						inQty1: 0,
						inQty2: 0,
						inQty3: 0,
						outQty1: 0,
						outQty2: 0,
						outQty3: 0,
					};

					for (const aa of dInItems) {
						result.inQty1 += aa.qty1;
						result.inQty2 += aa.qty2 ?? 0;
						result.inQty3 += aa.qty3 ?? 0;
						for (const bb of aa.dOutItems) {
							result.outQty1 += bb.qty1;
							result.outQty2 += bb.qty2 ?? 0;
							result.outQty3 += bb.qty3 ?? 0;
						}
					}

					return result;
				});

				return pagingResult(c1, page, limit, resultData);
			});
		}),

		export: procedure.input(zIds).query(({input, ctx}) => {
			const {inItem2, sjIn, sjOut, tIndex, item, outItem2} = attributes();

			return checkCredentialV2(ctx, async () => {
				type RetExport = typeof item.obj & {
					dInItems: (typeof inItem2.obj & {
						dSJIn: typeof sjIn.obj;
						dOutItems: (typeof outItem2.obj & {
							dSjOut: typeof sjOut.obj & {dIndex: typeof tIndex.obj};
						})[];
					})[];
				};

				const data = await item.model.findAll({
					where: {id: input.ids},
					attributes: item.attributes,
					include: [
						{
							...inItem2,
							include: [
								sjIn,
								{...outItem2, include: [{...sjOut, include: [tIndex]}]},
							],
						},
					],
				});

				const result = [];

				for (const dataItem of data) {
					const a = dataItem.toJSON() as unknown as RetExport;

					const emptyRow = {
						'Part Name': a.name,
						'Part Code': a.kode_item,
						'Tgl Masuk': '',
						'No SJ Masuk': '',
						'Qty (Box/Pallet)': '',
						'Qty Pcs': '',
						'Qty Kg': '',
						'Tgl Keluar': '',
						'No SJ Keluar': '',
						'Out Qty (Box/Pallet)': '',
						'Out Qty Pcs': '',
						'Out Qty Kg': '',
					};

					for (const b of a.dInItems) {
						let sjInRow = {
							...emptyRow,
							'Qty (Box/Pallet)': b.qty1?.toString()!,
							'Qty Pcs': b.qty2?.toString()!,
							'Qty Kg': b.qty3?.toString()!,
							'Tgl Masuk': dateUtils.short(b.createdAt),
							'No SJ Masuk': b.dSJIn.nomor_surat,
						};

						if (b.dOutItems.length === 0) result.push(sjInRow);
						else {
							for (let i = 0; i < b.dOutItems.length; i++) {
								const c = b.dOutItems[i]!;

								result.push({
									...sjInRow,
									'Tgl Keluar': dateUtils.short(c.createdAt),
									'No SJ Keluar': renderIndex(c.dSjOut),
									'Out Qty (Box/Pallet)': c.qty1,
									'Out Qty Pcs': c.qty2,
									'Out Qty Kg': c.qty3,
								});

								sjInRow = {
									...sjInRow,
									'Qty (Box/Pallet)': '',
									'Qty Pcs': '',
									'Qty Kg': '',
								};
							}
						}
					}
				}

				return result;
			});
		}),
	});
}
